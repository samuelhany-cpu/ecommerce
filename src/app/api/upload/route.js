import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No files received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");

        // Write to public/uploads
        const uploadDir = path.join(process.cwd(), "public/uploads");

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
        } catch (e) {
            console.error("Write error", e);
            return NextResponse.json({ error: "Failed to write file" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            url: "/uploads/" + filename
        });
    } catch (error) {
        console.log("Error occured ", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
