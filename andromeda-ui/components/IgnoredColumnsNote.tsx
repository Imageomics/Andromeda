export default function IgnoredColumnsNote() {
  return (
    <p className="ml-2 my-4 italic text-sm text-gray-500 max-w-[700px]">
        NOTE: CSV columns must contain only numeric values and at least 2
        unique values to be visualized. Columns not meeting these requirements will be ignored.
    </p>
  );
}

