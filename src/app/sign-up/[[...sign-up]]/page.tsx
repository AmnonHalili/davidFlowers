import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-20">
            <SignUp
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-stone-900 hover:bg-stone-800 text-white',
                        footerActionLink: 'text-stone-900 hover:text-stone-700',
                        card: 'shadow-none border border-stone-100 bg-white rounded-none',
                    }
                }}
            />
        </div>
    );
}
