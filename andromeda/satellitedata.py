import pandas as pd
import shapely
import geopandas

SAT_LABEL = "sat_label"
# 4 columns representing bounds of the satellite data
LAT_NW = "sat_Lat-NW"
LON_NW = "sat_Lon-NW"
LAT_SE = "sat_Lat-SE"
LON_SE = "sat_Lon-SE"


def make_shapely_box(row):
    return shapely.box(row[LAT_SE], row[LON_NW], row[LAT_NW], row[LON_SE])


def read_satellite_data(url):
    sat_df = pd.read_csv(url)
    sat_geo_series = geopandas.GeoSeries(sat_df.apply(make_shapely_box, axis=1))
    return sat_df, sat_geo_series


def find_satellite_records(sat_df, sat_geo_series, lat, long):
    point = shapely.Point(lat, long)
    matches_ary = sat_geo_series.contains(point)
    return sat_df[matches_ary].to_dict(orient="records")


def add_satellite_csv_data(observations, lat_fieldname, long_fieldname, satellite_csv_url):
    sat_df, sat_geo_series = read_satellite_data(satellite_csv_url)
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


def add_satellite_api_data(observations, lat_fieldname, long_fieldname):
    # TODO add in code to fetch data from a satellite API and add to the observations
    pass
