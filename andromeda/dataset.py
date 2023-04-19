import os
import uuid
import pandas as pd
from flask import abort
import andromeda

LABEL_COLUMN_NAME = "Image_Label"
URL_COLUMN_NAME = "Image_Link"


class DatasetStore(object):
    def __init__(self, base_directory):
        self.base_directory = base_directory

    def create_dataset(self, csv_file):
        dataset_id = str(uuid.uuid4())
        dataset = Dataset(dataset_id, self.base_directory)
        csv_file.save(dataset.get_path())
        dataset.validate_csv()
        return dataset

    def get_dataset(self, dataset_id):
        dataset = Dataset(dataset_id, self.base_directory)
        if not dataset.exists():
            abort(404, f"No dataset found for id {dataset_id}.")
        return dataset


class Dataset(object):
    def __init__(self, id, base_directory,
                 label_column_name=LABEL_COLUMN_NAME,
                 url_column_name=URL_COLUMN_NAME):
        self.id = id
        self.base_directory = base_directory
        self.label_column_name = label_column_name
        self.url_column_name = url_column_name

    def get_path(self):
        return os.path.join(self.base_directory, f"{self.id}.csv")

    def exists(self):
        return os.path.exists(self.get_path())

    def validate_csv(self):
        # TODO validate CSV content against self.label_column_name and self.url_column_name
        pass

    def read_dataframe(self):
        return pd.read_csv(self.get_path())

    def get_normalized_dataframe(self):
        return andromeda.normalized_df(self.read_dataframe())

    def get_label_to_url(self):
        df = self.read_dataframe()
        return dict(zip(df[self.label_column_name], df[self.url_column_name]))

    def add_label_and_url_columns(self, df):
        df["label"] = df.index.to_list()
        label_to_url = self.get_label_to_url()
        df["url"] = [label_to_url.get(label) for label in df.index.to_list()]

    def dimensional_reduction(self, weights):
        normalized_df = self.get_normalized_dataframe()
        weight_series = self.create_weight_series(weights, normalized_df.columns)

        image_coordinate_df = andromeda.dimension_reduction(normalized_df, weight_series)

        self.add_label_and_url_columns(image_coordinate_df)
        return weight_series.to_dict(), image_coordinate_df.to_dict('records')

    @staticmethod
    def create_weight_series(weights, columns):
        num_columns = len(columns)
        weight_ary = []
        if len(weights) == 1 and weights.get("all"):
            weight_ary = [weights["all"]] * num_columns
        else:
            for column in columns:
                value = weights.get(column)
                if not value:
                    abort(400, f"Missing weight for {column}")
                weight_ary.append(value)
        return pd.Series(weight_ary, index=columns, name="Weight")

    def inverse_dimensional_reduction(self, image_coordinates):
        normalized_df = self.get_normalized_dataframe()
        image_coordinate_df = self.create_image_coordinate_df(image_coordinates)
        filtered_normalized_df = normalized_df.filter(items = image_coordinate_df.index, axis=0)

        weights = andromeda.inverse_DR(filtered_normalized_df, image_coordinate_df)

        self.add_label_and_url_columns(image_coordinate_df)
        return weights.to_dict(), image_coordinate_df.to_dict('records')

    @staticmethod
    def create_image_coordinate_df(image_coordinates):
        try:
            df_2D = pd.DataFrame(image_coordinates, columns=["label", "x", "y"])
            df_2D.index = df_2D["label"]
            df_2D = df_2D.drop(["label"], axis=1)
            df_2D.index.name = "Image_Label"
            return df_2D
        except ValueError as e:
            abort(400, str(e))
