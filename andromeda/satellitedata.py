import os
import pandas as pd
import shapely
import geopandas

# 4 columns representing bounds of the satellite data
LAT_NW = "sat_Lat-NW"
LON_NW = "sat_Lon-NW"
LAT_SE = "sat_Lat-SE"
LON_SE = "sat_Lon-SE"
RGB_SATELLITE_URL = os.environ.get(
    "ANDROMEDA_RGB_SATELLITE_URL",
    "https://raw.githubusercontent.com/Imageomics/Andromeda/main/datasets/satelliteData/satRgbFinal4.csv"
)
LANDCOVER_SATELLITE_URL = os.environ.get("ANDROMEDA_LANDCOVER_URL")


def make_shapely_box(row):
    return shapely.box(row[LAT_SE], row[LON_NW], row[LAT_NW], row[LON_SE])


def read_satellite_data(url):
    sat_df = pd.read_csv(url)
    sat_geo_series = geopandas.GeoSeries(sat_df.apply(make_shapely_box, axis=1))
    return sat_df, sat_geo_series


def find_satellite_records(sat_df, sat_geo_series, lat, long):
    point = shapely.Point(lat, long)
    matches_ary = sat_geo_series.contains(point)
    matches = sat_df[matches_ary]
    # if the point exists in multiple regions find the closest to the centroid
    if len(matches.index) > 1:
        # calculate the distance between the point and the regions
        distances = sat_geo_series.centroid.distance(point)
        # find the minimum distance
        min_distance = min(distances)
        # find the closest points
        closest = distances == min_distance
        # those are our matches
        matches = sat_df[closest]
    return matches.to_dict(orient="records")


def merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname, url):
    sat_df, sat_geo_series = read_satellite_data(url)
    observations.add_fieldnames(list(sat_df.columns))
    has_a_match = False
    for obs in observations.data:
        lat = obs[lat_fieldname]
        long = obs[long_fieldname]
        if lat and long:
            matches = find_satellite_records(sat_df, sat_geo_series, lat, long)
            if matches:
                if len(matches) > 1:
                    observations.add_warning("multiple_sat_matches")
                obs.update(matches[0])
                has_a_match = True
    if not has_a_match:
        observations.add_warning("no_sat_matches")


def add_satellite_rgb_data(observations, lat_fieldname, long_fieldname):
    merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname, RGB_SATELLITE_URL)


def add_satellite_landcover_data(observations, lat_fieldname, long_fieldname):
    if LANDCOVER_SATELLITE_URL:
        merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname, LANDCOVER_SATELLITE_URL)
    else:
        observations.add_warning("landcover_not_setup")
