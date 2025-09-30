export async function helloworld() {
    const res = await fetch("http://localhost:8081/api/helloworld");
    if (!res.ok) throw new Error("Failed to fetch news");
    return res.json();
}