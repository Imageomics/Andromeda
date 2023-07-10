import pandas as pd
import unittest
from unittest.mock import Mock, patch

from satellitedata import (
    add_satellite_rgb_data,
    add_satellite_landcover_data,
    LAT_NW, LAT_SE, LON_NW, LON_SE
)


def sample_rgb_dataframe():
    columns = [LAT_NW, LON_NW, LAT_SE, LON_SE, "Number"]
    data = [
        (40.332624,	-74.749758,	40.313732,	-74.707701, 111),
        (40.365821,	-74.76289,	40.345643,	-74.720636, 222),
        (32, 32, 28, 28, 333),
        (31, 31, 27, 27, 444),
    ]
    return pd.DataFrame.from_records(data, columns=columns)


def sample_observation_data():
    return [
        {
            "id": "p1",
            "Lat": 40.33,
            "Long": -74.73
        }, {
            "id": "p2",
            "Lat": 40.35,
            "Long": -74.75
        }, {
            "id": "p3",
            "Lat": 40.32,
            "Long": -74.75
        }
    ]


class TestSatelliteData(unittest.TestCase):
    @patch("satellitedata.pd")
    @patch("satellitedata.RGB_SATELLITE_URL")
    def test_add_satellite_rgb_data(self, mock_rgb_url, mock_pd):
        sat_df = sample_rgb_dataframe()
        mock_pd.read_csv.return_value = sat_df
        observations = Mock(data=sample_observation_data())
        add_satellite_rgb_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 3)
        self.assertEqual(observations.data[0]["id"], "p1")
        self.assertEqual(observations.data[0]["Number"], 111)
        self.assertEqual(observations.data[1]["id"], "p2")
        self.assertEqual(observations.data[1]["Number"], 222)
        self.assertEqual(observations.data[2]["id"], "p3")
        self.assertEqual(observations.data[2].get("Number"), None)
        self.assertEqual(observations.add_warning.called, False)
        mock_pd.read_csv.assert_called_with(mock_rgb_url)

    @patch("satellitedata.pd")
    def test_add_satellite_rgb_data_no_match(self, mock_pd):
        sat_df = sample_rgb_dataframe()
        mock_pd.read_csv.return_value = sat_df
        unmatched_lat_long_data = [{
            "id": "p3",
            "Lat": 40.32,
            "Long": -74.75
        }]
        observations = Mock(data=unmatched_lat_long_data)
        add_satellite_rgb_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 1)
        self.assertEqual(observations.data[0]["id"], "p3")
        self.assertEqual(observations.data[0].get("Number"), None)
        self.assertEqual(observations.add_warning.called, True)
        observations.add_warning.assert_called_with('no_sat_matches')

    @patch("satellitedata.pd")
    def test_add_satellite_rgb_data_duplicates(self, mock_pd):
        sat_df = sample_rgb_dataframe()
        mock_pd.read_csv.return_value = sat_df
        unmatched_lat_long_data = [{
            "id": "p3",
            "Lat": 30,
            "Long": 30
        }]
        observations = Mock(data=unmatched_lat_long_data)
        add_satellite_rgb_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 1)
        self.assertEqual(observations.data[0]["id"], "p3")
        #self.assertEqual(observations.data[0].get("Number"), None)
        self.assertEqual(observations.add_warning.called, True)
        observations.add_warning.assert_called_with('multiple_sat_matches')

    @patch("satellitedata.pd")
    @patch("satellitedata.LANDCOVER_SATELLITE_URL")
    def test_add_satellite_landcover_data(self, mock_lc_url, mock_pd):
        sat_df = sample_rgb_dataframe()
        mock_pd.read_csv.return_value = sat_df
        observations = Mock(data=sample_observation_data())
        add_satellite_landcover_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 3)
        self.assertEqual(observations.data[0]["id"], "p1")
        self.assertEqual(observations.data[0]["Number"], 111)
        self.assertEqual(observations.data[1]["id"], "p2")
        self.assertEqual(observations.data[1]["Number"], 222)
        self.assertEqual(observations.data[2]["id"], "p3")
        self.assertEqual(observations.data[2].get("Number"), None)
        self.assertEqual(observations.add_warning.called, False)
        mock_pd.read_csv.assert_called_with(mock_lc_url)
