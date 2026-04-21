export default function PreferencesTab() {
  return (
    <div className="max-w-xl mx-auto space-y-4">

      <h2 className="text-lg font-bold text-gray-800">
        Preferences
      </h2>

      <select className="w-full bg-gray-50 p-3 rounded-xl">
        <option>English</option>
        <option>Amharic</option>
      </select>

      <select className="w-full bg-gray-50 p-3 rounded-xl">
        <option>Light Mode</option>
        <option>Dark Mode</option>
      </select>

      <button className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold">
        Save Preferences 
      </button>

    </div>
  );
}