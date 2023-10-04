import unittest
import datetime
from unittest.mock import patch
from inaturalist import (
    get_inaturalist_observations,
    create_csv_str,
    BadObservationException,
    OBSERVED_ON_MISSING_MSG,
    get_label,
    count_observerations,
    get_observations
)


class TestINaturalist(unittest.TestCase):
    @patch("inaturalist.get_observations")
    def test_get_inaturalist_observations(self, mock_get_observations):
        expected_columns = [
            "Image_Label",
            "Image_Link",
            "Species",
            "User",
            "Date",
            "Time",
            "Seconds",
            "Place",
            "Lat",
            "Long",
        ]
        item = {
            "photos": [{"url": "https://example.com/p1_square.png"}],
            "p1": ["ABC"],
            "observed_on": [datetime.datetime(2023, 6, 17, 16, 40)],
            "location": [35.3299475067, -84.1795960441],
            "place_guess": "Duke University",
            "user": {"login": "bob"},
            "species_guess": "Equus grevyi",
        }
        mock_get_observations.return_value = ([item], 1)

        observations = get_inaturalist_observations(user_id="user-1",
                                                    add_sat_rgb_data=False,
                                                    add_landcover_data=False,
                                                    limit=None)
        self.assertEqual(len(observations.data), 1)
        first_obs = observations.data[0]
        self.assertEqual(first_obs.keys(), set(expected_columns))
        self.assertEqual(first_obs["Image_Label"], "p1")
        self.assertEqual(first_obs["Image_Link"], "https://example.com/p1_medium.png")
        self.assertEqual(first_obs["Species"], "Equus grevyi")
        self.assertEqual(first_obs["Seconds"][0], 60000)
        self.assertEqual(first_obs["Place"], "Duke University")
        self.assertEqual(first_obs["Lat"], 35.3299475067)
        self.assertEqual(first_obs["Long"], -84.1795960441)
        self.assertEqual(observations.warnings, set())

    @patch("inaturalist.get_observations")
    def test_get_inaturalist_observations_with_limit(self, mock_get_observations):
        mock_get_observations.return_value = ([], 1)
        get_inaturalist_observations(user_id="user-1",
                                     add_sat_rgb_data=False,
                                     add_landcover_data=False,
                                     limit=10)
        mock_get_observations.assert_called_with(user_id='user-1', limit=10)

    @patch("inaturalist.get_observations")
    @patch("inaturalist.add_satellite_rgb_data")
    @patch("inaturalist.add_satellite_landcover_data")
    def test_get_inaturalist_observations_rgb(self, mock_add_satellite_landcover_data,
                                              mock_add_satellite_rgb_data,
                                              mock_get_observations):
        mock_get_observations.return_value = ([], 0)
        observations = get_inaturalist_observations(user_id="user-1",
                                                    add_sat_rgb_data=True,
                                                    add_landcover_data=False,
                                                    limit=None)
        mock_add_satellite_rgb_data.assert_called_with(observations, 'Lat', 'Long')
        mock_add_satellite_landcover_data.assert_not_called()

    @patch("inaturalist.get_observations")
    @patch("inaturalist.add_satellite_rgb_data")
    @patch("inaturalist.add_satellite_landcover_data")
    def test_get_inaturalist_observations_landcover(self, mock_add_satellite_landcover_data,
                                                    mock_add_satellite_rgb_data,
                                                    mock_get_observations):
        mock_get_observations.return_value = ([], 0)
        observations = get_inaturalist_observations(user_id="user-1",
                                                    add_sat_rgb_data=False,
                                                    add_landcover_data=True,
                                                    limit=None)
        mock_add_satellite_rgb_data.assert_not_called()
        mock_add_satellite_landcover_data.assert_called_with(observations, 'Lat', 'Long')

    @patch("inaturalist.get_observations")
    def test_get_inaturalist_observations_lat_lon_warning(self, mock_get_observations):
        item = {
            "photos": [{"url": "https://example.com/p1_square.png"}],
            "p1": ["ABC"],
            "observed_on": [datetime.datetime(2023, 6, 17, 16, 40)],
            "place_guess": "Duke University",
            "user": {"login": "bob"},
            "species_guess": "Equus grevyi",
        }

        mock_get_observations.return_value = ([item], 1)

        observations = get_inaturalist_observations(user_id="user-1",
                                                    add_sat_rgb_data=False,
                                                    add_landcover_data=False,
                                                    limit=None)
        self.assertEqual(len(observations.data), 1)
        self.assertEqual(observations.warnings,set(["missing_lat_long"]))

    def test_create_csv_str(self):
        observations = [
            {
                "Image_Label": "p1",
                "Image_Link": "https://example.com/p1.png",
            }
        ]
        result = create_csv_str(["Image_Label", "Image_Link"], observations)
        self.assertEqual(
            result.strip(), "Image_Label,Image_Link\np1,https://example.com/p1.png"
        )

    @patch("inaturalist.get_observations")
    def test_get_inaturalist_observations_no_observed(self, mock_get_observations):
        item = {
            "photos": [{"url": "https://example.com/p1_square.png"}],
            "p1": ["ABC"],
            "place_guess": "Duke University",
            "user": {"login": "bob"},
            "species_guess": "Equus grevyi",
        }
        mock_get_observations.return_value = ([item], 1)

        with self.assertRaises(BadObservationException) as raised_exception:
            get_inaturalist_observations(
                user_id="user-1",
                add_sat_rgb_data=False,
                add_landcover_data=False,
                limit=None)
        self.assertEqual(str(raised_exception.exception), OBSERVED_ON_MISSING_MSG)

    def test_get_label(self):
        self.assertEqual(get_label(idx=0, total_observations=10, reversed=False), "p1")
        self.assertEqual(get_label(idx=1, total_observations=10, reversed=False), "p2")
        self.assertEqual(get_label(idx=0, total_observations=10, reversed=True), "p10")
        self.assertEqual(get_label(idx=1, total_observations=20, reversed=True), "p19")

    @patch('inaturalist.pyinaturalist')
    def test_count_observations(self, mock_pyinaturalist):
        mock_pyinaturalist.get_observations.return_value = {
            "total_results": 11
        }
        self.assertEqual(count_observerations(user_id='bob1'), 11)
        mock_pyinaturalist.get_observations.assert_called_with(user_id='bob1', count_only=True)

    @patch('inaturalist.pyinaturalist')
    def test_get_observations(self, mock_pyinaturalist):
        mock_pyinaturalist.get_observations.return_value = {
            "total_results": 1,
            "results": [{ "id": 1}]
        }
        items, count = get_observations(user_id="bob1", limit=None)
        self.assertEqual(items, [{ "id": 1}])
        self.assertEqual(count, 1)
        mock_pyinaturalist.get_observations.assert_called_with(user_id='bob1', page='all')

        items, count = get_observations(user_id="bob1", limit=2)
        mock_pyinaturalist.get_observations.assert_called_with(user_id='bob1', per_page=2)
        self.assertEqual(items, [{ "id": 1}])
        self.assertEqual(count, 1)
