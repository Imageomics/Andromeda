
# Data Retrieval Information

Landcover percentages were generated with the code in [`mapping.py`](https://github.com/Imageomics/Andromeda/blob/main/datasets/data_retrieval/mapping.py) and [`mapping_broad.py`](https://github.com/Imageomics/Andromeda/blob/main/datasets/data_retrieval/mapping_broad.py).

[`updating_regions_local.ipynb`](https://github.com/Imageomics/Andromeda/blob/main/datasets/data_retrieval/updating_regions_local.ipynb) used functions from `mapping.py` to fetch and manipulate the data, while  
`mapping_broad.py` was used directly to generate the broad regions. 

**Note:** The local notebook utilizes login information for an ArcGIS developer account, while `mapping_broad.py` requires an API key for ArcGIS. 

The reference CSVs were generated using the first parts of `CSV_editing_local.ipynb` and `CSV_editing_broad.ipynb`, respectively. These notebooks were also used after data collection to knit together all the data into [`landcover-nj-2023.csv`](https://github.com/Imageomics/Andromeda/blob/main/datasets/satelliteData/landcover-nj-2023.csv) for use with Andromeda.



### Note on ArcGIS Install 

It requires first installing `urllib3` version 1.26.0 (until the fall 2023 update of `arcgis` package). These files used `arcgis` version 2.1.0.3.

#### For M1 & M2 Macs:

The `arcgis` package is not yet native to Apple Silicon, so it requires Rosetta 2 emulating Intel i386 architecture (see note [here](https://joelmccune.com/install-arcgis-python-api-on-apple-silicon/) on Conda setup). 



### References/Source Information

Reference map from ArcGIS which utilizes the Land Use/Land Cover of New Jersey 2015 ArcGIS Layer from NJDEP Bureau of GIS 
URL for Layer information: [https://mapsdep.nj.gov/arcgis/rest/services/Features/Land_lu/MapServer/13](https://mapsdep.nj.gov/arcgis/rest/services/Features/Land_lu/MapServer/13) 


**Credit/Disclaimer:** This map was developed using New Jersey Department of Environmental Protection Geographic Information System digital data, but this secondary product has not been verified by NJDEP and is not state-authorized or endorsed.

_Powered by Esri_

**Source:** Esri, NASA, NGA, USGS, FEMA | New Jersey Office of GIS, Esri, HERE, Garmin, SafeGraph, GeoTechnologies, Inc, MÈTI/NASA, USGS, EPA, NPS, US Census Bureau, USDA | Ni Department of Environmental Protection (NJDEP), Division of Information Technology (DOIT), Bureau of Geographic Information System (BGiS)

Web map ID for map utilizing the above layer: [2705228b2b154d0a906ef7a54e533fac](https://www.arcgis.com/home/search.html?restrict=false&sortField=relevance&sortOrder=desc&searchTerm=2705228b2b154d0a906ef7a54e533fac#content)