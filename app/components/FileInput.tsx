import { useSpreadsheet } from "@/context/spreadsheet-context";

export function FileInput() {
  const { handleFileUpload, loading } = useSpreadsheet();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  };

  return (
    <input
      type="file"
      accept=".csv,.xlsx,.xls"
      onChange={handleChange}
      disabled={loading}
      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
    />
  );
} 