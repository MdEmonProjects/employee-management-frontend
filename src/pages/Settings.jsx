import { Link } from "react-router-dom";
import SvgIcon from "../components/icons/SvgIcon";

export default function Settings() {
    return (
        <div className="flex-1">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[5px] p-4">
                        <Link to={"/dashboard/departments"}>
                            <div className="icon mb-2 text-[#0b0b0b] text-center flex align-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-building-cog">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M3 21h9" />
                                    <path d="M9 8h1" />
                                    <path d="M9 12h1" />
                                    <path d="M9 16h1" />
                                    <path d="M14 8h1" />
                                    <path d="M14 12h1" />
                                    <path d="M5 21v-16c0 -.53 .211 -1.039 .586 -1.414c.375 -.375 .884 -.586 1.414 -.586h10c.53 0 1.039 .211 1.414 .586c.375 .375 .586 .884 .586 1.414v7" />
                                    <path d="M16 18c0 .53 .211 1.039 .586 1.414c.375 .375 .884 .586 1.414 .586c.53 0 1.039 -.211 1.414 -.586c.375 -.375 .586 -.884 .586 -1.414c0 -.53 -.211 -1.039 -.586 -1.414c-.375 -.375 -.884 -.586 -1.414 -.586c-.53 0 -1.039 .211 -1.414 .586c-.375 .375 -.586 .884 -.586 1.414" />
                                    <path d="M18 14.5v1.5" />
                                    <path d="M18 20v1.5" />
                                    <path d="M21.032 16.25l-1.299 .75" />
                                    <path d="M16.27 19l-1.3 .75" />
                                    <path d="M14.97 16.25l1.3 .75" />
                                    <path d="M19.733 19l1.3 .75" />
                                </svg>
                            </div>
                            <p className="text-center text-[16px]">Department</p>
                        </Link>
                    </div>
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[4px]">
                        <div className="icon">
                            <SvgIcon name={"FaEye"} />
                        </div>
                        <h3 className="text-center">Departments</h3>
                    </div>
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[4px]">
                        <div className="icon">
                            <SvgIcon name={"FaEye"} />
                        </div>
                        <h3 className="text-center">Departments</h3>
                    </div>
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[4px]">
                        <div className="icon">
                            <SvgIcon name={"FaEye"} />
                        </div>
                        <h3 className="text-center">Departments</h3>
                    </div>
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[4px]">
                        <div className="icon">
                            <SvgIcon name={"FaEye"} />
                        </div>
                        <h3 className="text-center">Departments</h3>
                    </div>
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[4px]">
                        <div className="icon">
                            <SvgIcon name={"FaEye"} />
                        </div>
                        <h3 className="text-center">Departments</h3>
                    </div>
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[4px]">
                        <div className="icon">
                            <SvgIcon name={"FaEye"} />
                        </div>
                        <h3 className="text-center">Departments</h3>
                    </div>
                    <div className="card bg-[#ffffff80] border border-[#0b0b0b1a] rounded-[4px]">
                        <div className="icon">
                            <SvgIcon name={"FaEye"} />
                        </div>
                        <h3 className="text-center">Departments</h3>
                    </div>

                </div>
            </div>
        </div>
    );
}