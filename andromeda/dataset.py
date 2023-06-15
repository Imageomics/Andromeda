import os
import uuid
import pandas as pd
from flask import abort
import andromeda


class DatasetStore(object):
    def __init__(self, base_directory):
        self.base_directory = base_directory

    def create_dataset(self, csv_file):
        dataset_id = str(uuid.uuid4())
        dataset = Dataset(dataset_id, self.base_directory)
        csv_file.save(dataset.get_path())
        return dataset

    def get_dataset(self, dataset_id, column_settings):
        dataset = Dataset(
            dataset_id,
            self.base_directory,
            column_settings["label"],
            column_settings.get("url"),
            column_settings["selected"],
        )
        if not dataset.exists():
            abort(404, f"No dataset found for id {dataset_id}.")
        return dataset


class Dataset(object):
    def __init__(
        self,
        id,
        base_directory,
        label_column_name=None,
        url_column_name=None,
        selected_columns=None,
    ):
        self.id = id
        self.base_directory = base_directory
        self.label_column_name = label_column_name
        self.url_column_name = url_column_name
        self.selected_columns = selected_columns

    def get_path(self):
        return os.path.join(self.base_directory, f"{self.id}.csv")

    def exists(self):
        return os.path.exists(self.get_path())

    def read_dataframe(self):
        # Disabling logic that adds NaN for empty strings to avoid invalid JSON creation later
        return pd.read_csv(self.get_path(), keep_default_na=False)

    def get_normalized_dataframe(self):
        df = andromeda.normalized_df(self.read_dataframe(), self.label_column_name)
        if self.label_column_name in self.selected_columns:
            print("Index is also a column")
            df.reset_index(inplace=True)

        return df[self.selected_columns]

    def get_label_to_url(self):
        df = self.read_dataframe()
        return dict(zip(df[self.label_column_name], df[self.url_column_name]))

    def add_label_and_url_columns(self, df):
        df["label"] = df.index.to_list()
        if self.url_column_name:
            label_to_url = self.get_label_to_url()
            df["url"] = [label_to_url.get(label) for label in df.index.to_list()]

    def dimensional_reduction(self, weights):
        normalized_df = self.get_normalized_dataframe()
        weight_series = self.create_weight_series(weights, normalized_df.columns)

        image_coordinate_df = andromeda.dimension_reduction(
            normalized_df, weight_series
        )

        self.add_label_and_url_columns(image_coordinate_df)
        return weight_series.to_dict(), image_coordinate_df.to_dict("records")

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
        filtered_normalized_df = normalized_df.filter(
            items=image_coordinate_df.index, axis=0
        )

        weights = andromeda.inverse_DR(filtered_normalized_df, image_coordinate_df)

        self.add_label_and_url_columns(image_coordinate_df)
        return weights.to_dict(), image_coordinate_df.to_dict("records")

    def create_image_coordinate_df(self, image_coordinates):
        try:
            df_2D = pd.DataFrame(image_coordinates, columns=["label", "x", "y"])
            df_2D.index = df_2D["label"]
            df_2D = df_2D.drop(["label"], axis=1)
            df_2D.index.name = self.label_column_name
            return df_2D
        except ValueError as e:
            abort(400, str(e))
