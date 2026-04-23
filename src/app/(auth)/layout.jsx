

export default function RootLayout({ children }) {
    return (
        <div>
            <span className="min-h-full flex flex-col">{children}</span>
        </div>
    );
}
