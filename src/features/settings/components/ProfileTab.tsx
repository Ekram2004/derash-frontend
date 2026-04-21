export default function ProfileTab({ user }: any) {
  return (
    <div className="max-w-xl mx-auto space-y-4">

      <h2 className="text-lg font-bold text-gray-800">
        Profile Information
      </h2>

      <input
        className="w-full bg-gray-50 rounded-xl p-3"
        defaultValue={user?.name}
        placeholder="Full Name"
      />

      <input
        className="w-full bg-gray-50 rounded-xl p-3"
        defaultValue={user?.email}
        placeholder="Email"
      />

      <input
        className="w-full bg-gray-50 rounded-xl p-3"
        placeholder="Phone Number"
      />

      <button className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold">
        Save Profile (Mock)
      </button>
    </div>
  );
}