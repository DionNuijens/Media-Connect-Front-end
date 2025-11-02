import { helloworld } from "@/app/lib/api/media-api";
import { helloworld2 } from "@/app/lib/api/auth-api";
import { helloworld3 } from "@/app/lib/api/social-api";

type Message = {
    id: number;
    message: string;
    source?: string; // optional, to know which API it came from
};

export default async function Home() {
    const data: Message[] = await helloworld();
    const data2: Message[] = await helloworld2();
    const data3: Message[] = await helloworld3();

    // Merge all arrays and optionally tag the source
    const mergedData: Message[] = [
        ...data.map(item => ({ ...item, source: "Media API" })),
        ...data2.map(item => ({ ...item, source: "Auth API" })),
        ...data3.map(item => ({ ...item, source: "Social API" })),
    ];

    return (
        <div>
            {mergedData.map(item => (
                <div key={`${item.source}-${item.id}`}>
                    <strong>{item.source}:</strong> {item.message}
                </div>
            ))}
        </div>
    );
}