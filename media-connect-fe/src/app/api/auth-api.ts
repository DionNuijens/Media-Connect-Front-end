export async function helloworld2() {
    const res = await fetch("http://localhost:8080/api/helloworld");
    if (!res.ok) throw new Error("Failed to fetch news");
    return res.json();
}