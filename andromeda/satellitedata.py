import pandas as pd
import shapely
import geopandas
from mapping_copy import get_layer, get_landcover_percentages

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


def add_landcover_api_data(observations, lat_fieldname, long_fieldname):
    '''
    TODO determine where user login belongs for access to ArcGIS, if here add to parameters, otherwise gis is parameter and update get_layer accordingly.
    NOTE get_layer should only be called once per dataset request, while get_landcover_percentages and the functions it depends on are row-by-row (lat, lon pair dependent).
    
    Function to fetch data from a ArcGIS API and add to the observations.

    Parameters:
    -----------
    observations - Observations object. Contains iNaturalist data and possibly matching satellite data.
    lat_fieldname - Latitude column/reference name.
    long_fieldname - Longitude column/reference name.
    
    '''
    REGIONS = ['GRASSY',
                'DENSE_WOOD',
                'WOODY',
                'SUBURBAN',
                'WATERY',
                'URBAN',
                'AGRICULTURAL'
                ]
    observations.add_fieldnames(REGIONS)
    layer = get_layer()
    for obs in observations.data:
        lat = obs[lat_fieldname]
        lon = obs[long_fieldname]
        if lat and lon:
            percentages = get_landcover_percentages(layer, lat, lon)
            obs.update(percentages)
