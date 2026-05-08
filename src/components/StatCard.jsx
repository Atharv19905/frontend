export default function StatCard({ title, value, color }) {

    return (

        <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-gray-500">
                {title}
            </h3>

            <p className={`text-3xl font-bold ${color}`}>
                {value}
            </p>

        </div>

    )

}