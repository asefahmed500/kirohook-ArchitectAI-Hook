export default function UserCard({ name, email, createdAt }: { name: string; email: string; createdAt?: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{email}</div>
          {createdAt && <div className="text-xs text-gray-400 mt-0.5">{new Date(createdAt).toLocaleDateString()}</div>}
        </div>
      </div>
    </div>
  );
}
