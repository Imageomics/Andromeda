import unittest
from unittest.mock import Mock, patch
from io import BytesIO
from main import app
from inaturalist import BadObservationException, OBSERVED_ON_MISSING_MSG

class TestDataset(unittest.TestCase):
    @patch("main.DatasetStore")
    def test_create_dataset(self, mock_dataset_store):
        mock_dataset_store.return_value.create_dataset.return_value = Mock(
            id="9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        )

        client = app.test_client()
        result = client.post(
            "/api/dataset/", data={"file": (BytesIO(b"stuff"), "file.csv")}
        )
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json, {"id": "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"})

    @patch("main.DatasetStore")
    def test_get_dataset(self, mock_dataset_store):
        ds_uuid = "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        mock_dataset_store.return_value.get_dataset_path.return_value = "../datasets/testData/mockData_v1.csv"
        client = app.test_client()
        result = client.get(f"/api/dataset/{ds_uuid}?filename=data.csv")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.headers.get("Content-Disposition"), "attachment; filename=data.csv")
        self.assertIn("iNat_label,sat_label,iNat_url", result.text)

    @patch("main.DatasetStore")
    def test_dimensional_reduction(self, mock_dataset_store):
        mock_dataset = Mock()
        mock_weights = {"B1": 0.4}
        mock_coordinates = [{"label": "p1", "x": 0.4, "y": 0.5}]
        mock_dataset.dimensional_reduction.return_value = (
            mock_weights,
            mock_coordinates,
        )
        mock_dataset_store.return_value.get_dataset.return_value = mock_dataset

        dataset_id = "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        client = app.test_client()
        result = client.post(
            f"/api/dataset/{dataset_id}/dimensional-reduction",
            json={
                "weights": {"B1": 0.4},
                "columnSettings": {
                    "label": "Image_Label",
                    "url": "Image_URL",
                    "selected": ["R1", "B1", "G1"],
                },
            },
        )
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.json,
            {"id": dataset_id, "weights": mock_weights, "images": mock_coordinates},
        )

    @patch("main.DatasetStore")
    def test_inverse_dimensional_reduction(self, mock_dataset_store):
        mock_dataset = Mock()
        mock_weights = {"B1": 0.4}
        mock_coordinates = [{"label": "p1", "x": 0.4, "y": 0.5}]
        mock_dataset.inverse_dimensional_reduction.return_value = (
            mock_weights,
            mock_coordinates,
        )
        mock_dataset_store.return_value.get_dataset.return_value = mock_dataset

        dataset_id = "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        client = app.test_client()
        result = client.post(
            f"/api/dataset/{dataset_id}/inverse-dimensional-reduction",
            json={
                "images": [{"label": "p1", "x": 0.1, "y": 0.1}],
                "columnSettings": {
                    "label": "Image_Label",
                    "url": "Image_URL",
                    "selected": ["R1", "B1", "G1"],
                },
            },
        )
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.json,
            {"id": dataset_id, "weights": mock_weights, "images": mock_coordinates},
        )

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist(self, mock_get_inaturalist_observations):
        observations = [{"Image_Label": "p1"}]
        warnings = ["missing_lat_long"]
        mock_get_inaturalist_observations.return_value = Mock(
            data=observations, warnings=warnings, total=1)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.json,
            {
                'total': 1,
                "data": [{"Image_Label": "p1"}],
                "user_id": "bob",
                "warnings": ["missing_lat_long"],
            },
        )
        mock_get_inaturalist_observations.assert_called_with(
            user_id='bob', add_sat_rgb_data=False, add_landcover_data=False, limit=None
        )        

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_limit(self, mock_get_inaturalist_observations):
        observations = [{"Image_Label": "p1"}]
        warnings = ["missing_lat_long"]
        mock_get_inaturalist_observations.return_value = Mock(
            data=observations, warnings=warnings, total=1)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?limit=6")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.json,
            {
                'total': 1,
                "data": [{"Image_Label": "p1"}],
                "user_id": "bob",
                "warnings": ["missing_lat_long"],
            },
        )
        mock_get_inaturalist_observations.assert_called_with(
            user_id='bob', add_sat_rgb_data=False, add_landcover_data=False, limit=6
        )

    @patch("main.get_inaturalist_observations")
    def test_create_inaturalist_dataset(self, mock_get_inaturalist_observations):
        observations = [{"Image_Label": "p1"}]
        warnings = ["missing_lat_long"]
        fieldnames = ["Image_Label", "Image_Link", "Species", "User", "Date", "Time",
                      "Seconds", "Place", "Lat", "Long"]
        mock_get_inaturalist_observations.return_value = Mock(
            data=observations,
            fieldnames=fieldnames,
            warnings=warnings)
        client = app.test_client()
        result = client.post(f"/api/inaturalist/bob/dataset")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(list(result.json.keys()), ["id", "url", "warnings"])

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_csv(self, mock_get_inaturalist_observations):
        observations = [{"Image_Label": "p1"}]
        warnings = ["missing_lat_long"]
        fieldnames = ["Image_Label", "Image_Link", "Species", "User", "Date", "Time",
                      "Seconds", "Place", "Lat", "Long"]
        mock_get_inaturalist_observations.return_value = Mock(
            data=observations,
            fieldnames=fieldnames,
            warnings=warnings)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?format=csv")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.text.strip(),
            "Image_Label,Image_Link,Species,User,Date,Time,Seconds,Place,Lat,Long\n"
            + "p1,,,,,,,,,",
        )

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_xml(self, mock_get_inaturalist_observations):
        mock_get_inaturalist_observations.return_value = Mock(data=[], warnings=[], total=0)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?format=xml")
        self.assertEqual(result.status_code, 400)
        self.assertEqual(result.json.get("description"), "Unsupported format parameter value xml")

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_add_rgb(self, mock_get_inaturalist_observations):
        mock_get_inaturalist_observations.return_value = Mock(data=[], warnings=[], total=0)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?format=json&add_sat_rgb_data=true")
        self.assertEqual(result.status_code, 200)
        mock_get_inaturalist_observations.assert_called_with(user_id='bob', add_sat_rgb_data=True,
                                                             add_landcover_data=False, limit=None)

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_add_landcover(self, mock_get_inaturalist_observations):
        mock_get_inaturalist_observations.return_value = Mock(data=[], warnings=[], total=0)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?format=json&add_landcover_data=true")
        self.assertEqual(result.status_code, 200)
        mock_get_inaturalist_observations.assert_called_with(user_id='bob', add_sat_rgb_data=False,
                                                             add_landcover_data=True, limit=None)

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_bad_observation(self, mock_get_inaturalist_observations):
        mock_get_inaturalist_observations.side_effect = BadObservationException(OBSERVED_ON_MISSING_MSG)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?format=json&add_landcover_data=true")
        self.assertEqual(result.status_code, 400)
        self.assertIn("missing the 'Observed' date/time", result.text)

    def test_get_get_column_config(self):
        client = app.test_client()
        result = client.get(f"/api/column-config")
        self.assertEqual(result.status_code, 200)
        self.assertIn("ancillary_columns", result.json.keys())
