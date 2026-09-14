import { showModal } from "../utils/ModalControlar";

export default function Departments() {
    const handleDepartmentCreate = () => {
        showModal("Add Department", "ADD_DEPARTMENTS")
    };
    return (
        <div className="flex-1 pt-[50px]">
            <div className="container mx-auto">
                <div className="header_area flex justify-between">
                    <h1 className="text-[24px] font-medium">Departments</h1>
                    <button onClick={handleDepartmentCreate} className="bg-black text-white px-3 py-2 rounded-[10px] text-[14px]">New Departments</button>
                </div>
                {/* Content area */}
                <div className="flex items-center justify-center flex-col text-center pt-[60px]">
                    <div className="img_area">
                        <img src="/svgviewer-output.svg" />
                    </div>
                    <h3 className="max-w-xs font-medium text-[#52514E]">Looking to start a department?</h3>
                    <p className="max-w-xs text-footnote text-[#52514E] mt-5 mb-4">Manage Designation, set custom instructions, and organize task in one space.</p>
                    <button onClick={handleDepartmentCreate} className="border border-[#0b0b0b1a] bg-white text-[#0B0B0B] px-3 py-2 rounded-[10px] text-[14px]">New Departments</button>
                </div>


            </div>
        </div>
    );
}