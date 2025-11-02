export async function helloworld3() {
    const res = await fetch("http://localhost:8082/api/helloworld");
    if (!res.ok) throw new Error("Failed to fetch news");
    return res.json();
}