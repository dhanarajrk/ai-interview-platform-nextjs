//After start session, will be redirected to this page

//to extract dynamic [id] from path we destruct { params }
export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) { //In Nextjs 15+ params content becomes a Promise so we have to use Async Await to get params
    const { id } = await params; //destruct id from params: { id: "123"} 

    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
                <h1 className="text-xl font-semibold">Session</h1>
                <p className="mt-1 text-sm text-neutral-600">Session ID: {id}</p>

                <div className="mt-6 rounded-xl border bg-neutral-50 p-4 text-sm text-neutral-700">
                    Fetching Question and Rendering Answer
                </div>
            </div>
        </main>
    );
}