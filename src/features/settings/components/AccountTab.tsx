export default function AccountTab({ user }: any) {
  return (
    <div className="max-w-xl mx-auto space-y-5">

      <h2 className="text-lg font-bold">Account Security</h2>

      <div className="bg-gray-50 p-4 rounded-xl">
        <p><b>Name:</b> {user?.name}</p>
        <p><b>Role:</b> {user?.role}</p>
      </div>

      {/* SESSION CONTROL */}
      <div className="space-y-3">

        <button className="w-full bg-gray-900 text-white py-3 rounded-xl">
          Logout All Devices
        </button>

        <button className="w-full bg-red-600 text-white py-3 rounded-xl">
          Delete Account (Disabled)
        </button>

      </div>

    </div>
  );
}