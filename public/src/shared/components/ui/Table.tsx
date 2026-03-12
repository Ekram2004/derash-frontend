/*import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: Array<{ [K in keyof T]: ReactNode }>; // <- Allow JSX in cells
}

export default function Table<T>({ columns, data }: TableProps<T>) {
  return (
    <div className="overflow-auto rounded shadow bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className="px-6 py-3 text-left text-sm font-medium text-gray-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={String(col.accessor)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}*/