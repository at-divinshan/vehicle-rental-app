"""API integration checks using an isolated in-memory database."""
import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


class LoginFlowTest(unittest.TestCase):
    def setUp(self):
        test_url = os.environ.get("TEST_DATABASE_URL")
        self.engine = (create_engine(test_url) if test_url else create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        ))
        if test_url and inspect(self.engine).get_table_names():
            self.engine.dispose()
            raise RuntimeError("TEST_DATABASE_URL must point to an empty, disposable database")
        self.sessions = sessionmaker(bind=self.engine)
        self.engine_patch = patch("app.main.engine", self.engine)
        self.sessions_patch = patch("app.main.SessionLocal", self.sessions)
        self.engine_patch.start()
        self.sessions_patch.start()

        def test_db():
            with self.sessions() as db:
                yield db

        app.dependency_overrides[get_db] = test_db
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        app.dependency_overrides.clear()
        self.sessions_patch.stop()
        self.engine_patch.stop()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_registration_login_booking_and_cancellation(self):
        account = {"full_name": "Rental Test", "email": "rental-test@example.com", "password": "Test-only-password-123"}
        response = self.client.post("/auth/register", json=account)
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()["user"]["role"], "user")
        self.assertEqual(self.client.post("/auth/register", json=account).status_code, 409)
        self.assertEqual(self.client.post("/auth/login", json={**account, "password": "wrong"}).status_code, 401)
        response = self.client.post("/auth/login", json=account)
        self.assertEqual(response.status_code, 200, response.text)
        headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        self.assertEqual(self.client.get("/auth/me", headers=headers).json()["email"], account["email"])
        self.assertEqual(self.client.get("/bookings").status_code, 401)
        self.assertEqual(self.client.get("/auth/me", headers={"Authorization": "Bearer expired"}).status_code, 401)
        fleet = self.client.get("/vehicles").json()
        vehicle = next(item for item in fleet if item["is_available"])
        payload = {
            "vehicle_id": vehicle["id"], "customer_name": "Rental Test", "customer_phone": "0770000000",
            "pickup_date": "2030-01-01", "return_date": "2030-01-03",
            "pickup_location": "Mathagal", "return_location": "Mathagal", "services": ["gps"],
        }
        response = self.client.post("/bookings", headers=headers, json=payload)
        self.assertEqual(response.status_code, 201, response.text)
        booking = response.json()
        self.assertEqual(booking["rental_days"], 2)
        self.assertAlmostEqual(float(booking["total_amount"]), (float(vehicle["price_per_day"]) * 2 + 300) * 1.08)
        self.assertEqual(self.client.get("/bookings", headers=headers).json()[0]["booking_id"], booking["booking_id"])
        other = self.client.post("/auth/register", json={**account, "email": "other-test@example.com"}).json()
        other_headers = {"Authorization": f"Bearer {other['access_token']}"}
        self.assertEqual(self.client.get("/bookings", headers=other_headers).json(), [])
        cancel_url = f"/bookings/{booking['booking_id']}/cancel"
        self.assertEqual(self.client.patch(cancel_url, headers=other_headers).status_code, 404)
        self.assertEqual(self.client.patch(cancel_url, headers=headers).json()["status"], "Cancelled")
        self.assertEqual(self.client.get("/bookings", headers=headers).json()[0]["status"], "Cancelled")


    def test_admin_edits_and_permissions(self):
        from app.config import settings
        login = self.client.post("/auth/login", json={"email": settings.admin_email, "password": settings.admin_password})
        self.assertEqual(login.status_code, 200)
        admin = {"Authorization": f"Bearer {login.json()['access_token']}"}
        account = {"full_name": "Customer Before", "email": "before@example.com", "password": "Test-only-password-123", "phone": "0771111111"}
        registered = self.client.post("/auth/register", json=account).json()
        customer_id = registered["user"]["id"]
        customer = {"Authorization": f"Bearer {registered['access_token']}"}
        vehicle = self.client.get("/vehicles").json()[0]
        payload = {key: value for key, value in vehicle.items() if key != "id"}
        payload.update({"price_per_day": "4200.50", "location": "Jaffna", "is_available": False})
        route = f"/vehicles/{vehicle['id']}"
        for method, url, body in [("get", "/customers", None), ("put", route, payload), ("put", f"/customers/{customer_id}", {"full_name": "Changed", "email": "changed@example.com"}), ("patch", "/bookings/missing/status", {"status": "Completed"})]:
            options = {"json": body} if body else {}
            self.assertEqual(self.client.request(method, url, **options).status_code, 401)
            self.assertEqual(self.client.request(method, url, headers=customer, **options).status_code, 403)
        saved = self.client.put(route, json=payload, headers=admin)
        self.assertEqual(saved.status_code, 200, saved.text)
        refreshed = self.client.get(route).json()
        self.assertEqual(float(refreshed["price_per_day"]), 4200.50)
        self.assertEqual(refreshed["location"], "Jaffna")
        self.assertFalse(refreshed["is_available"])
        self.assertEqual(self.client.put(route, json={**payload, "price_per_day": -1}, headers=admin).status_code, 422)
        self.assertEqual(self.client.put(route, json={**payload, "brand": "   "}, headers=admin).status_code, 422)
        other_vehicle = self.client.get("/vehicles").json()[1]
        self.assertEqual(self.client.put(route, json={**payload, "reg_number": other_vehicle["reg_number"]}, headers=admin).status_code, 409)
        self.assertEqual(self.client.get(route).json()["reg_number"], vehicle["reg_number"])
        self.assertEqual(self.client.put("/vehicles/99999", json=payload, headers=admin).status_code, 404)
        people = self.client.get("/customers", headers=admin).json()
        self.assertEqual([item["id"] for item in people], [customer_id])
        self.assertNotIn("password_hash", people[0])
        profile = {"full_name": "Customer After", "email": "after@example.com", "phone": "0772222222"}
        self.assertEqual(self.client.put(f"/customers/{customer_id}", json=profile, headers=admin).status_code, 200)
        self.assertEqual(self.client.get("/customers", headers=admin).json()[0]["phone"], profile["phone"])
        self.assertEqual(self.client.post("/auth/login", json={"email": profile["email"], "password": account["password"]}).status_code, 200)
        self.assertEqual(self.client.put(f"/customers/{customer_id}", json={**profile, "email": settings.admin_email}, headers=admin).status_code, 409)
        self.assertEqual(self.client.put(f"/customers/{customer_id}", json={**profile, "role": "admin"}, headers=admin).status_code, 422)
        booking_payload = {"vehicle_id": other_vehicle["id"], "customer_name": "Customer Before", "customer_phone": "0771111111", "pickup_date": "2030-02-01", "return_date": "2030-02-03", "pickup_location": "Jaffna", "return_location": "Jaffna", "services": []}
        booking = self.client.post("/bookings", headers=customer, json=booking_payload).json()
        status_route = f"/bookings/{booking['booking_id']}/status"
        self.assertEqual(self.client.patch(status_route, json={"status": "Completed"}, headers=admin).status_code, 200)
        persisted = self.client.get("/bookings", headers=customer).json()[0]
        self.assertEqual(persisted["status"], "Completed")
        self.assertEqual(persisted["customer_name"], "Customer Before")
        self.assertEqual(persisted["total_amount"], booking["total_amount"])
        self.assertEqual(self.client.patch(status_route, json={"status": "Invalid"}, headers=admin).status_code, 422)


if __name__ == "__main__":
    unittest.main()
