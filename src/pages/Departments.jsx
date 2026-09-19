import { showModal } from "../utils/ModalControlar";
import SortableTable from "../components/SortableTable";
import { useGetDepartmentsQuery } from "../features/department/departmentQuerySlice";

export default function Departments() {
    const { data: departments = [], isLoading, isError } = useGetDepartmentsQuery();
    const handleDepartmentCreate = () => {
        showModal("Add Department", "ADD_DEPARTMENTS")
    };

    const columns = [
        { title: "Department", field: "name", type: "text", filterable: true },
        {
            title: "Parent department",
            field: "parentDepartment",
            render: (department) => department.parentDepartment?.name || "N/A",
        },
        {
            title: "Child departments",
            field: "children",
            hozAlign: "center",
            render: (department) => department._count?.children ?? 0,
        },
        {
            title: "Employees",
            field: "employees",
            hozAlign: "center",
            render: (department) => department._count?.employees ?? 0,
        },
    ];

    return (
        <div className="flex-1 pt-[50px]">
            <div className="container mx-auto">
                <div className="header_area flex justify-between">
                    <h1 className="text-[24px] font-medium">Departments</h1>
                    <button onClick={handleDepartmentCreate} className="bg-black text-white px-3 py-2 rounded-[10px] text-[14px]">New Departments</button>
                </div>
                {/* Content area */}
                {isLoading && <p className="pt-[60px] text-center text-[#52514E]">Loading departments...</p>}
                {isError && <p className="pt-[60px] text-center text-red-600">Unable to load departments.</p>}
                {!isLoading && !isError && departments.length > 0 && (
                    <div className="mt-8 grid grid-cols-3">

                        <div className="flex min-h-0 flex-1 flex-col self-stretch gap-[20px] rounded-[10px] p-[14px] border border-[#0b0b0b1a]">
                            <div className="flex items-start gap-md gap-[20px]">

                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-surface-0 text-secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-command">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10" />
                                    </svg>
                                </div>

                                {/* Content */}
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <div className="flex min-w-0 items-center gap-xs">
                                        <span className="truncate text-body-medium text-primary">
                                            <span
                                                data-cds="CardLink"
                                                role="button"
                                                tabIndex={0}
                                                aria-label="View Plugin Management"
                                                className="cds-reset outline-none after:absolute after:inset-0 after:rounded-card after:content-[''] cursor-pointer [scroll-margin-top:var(--list-header-scroll-offset,0px)] [scroll-margin-bottom:var(--customize-page-footer-offset,0px)]"
                                            >
                                                Plugin Management
                                            </span>
                                        </span>
                                    </div>

                                    <span className="line-clamp-2 min-h-[2lh] text-pretty text-secondary text-body">
                                        Create, customize, and manage plugins tailored to your
                                        organization's tools and workflows. Configure MCP servers,
                                        adjust plugin behavior, and adapt templates to match how
                                        your team works.
                                    </span>

                                    <span
                                        className="relative flex min-w-0 items-baseline gap-xs text-footnote text-muted cursor-pointer"
                                        data-testid="discover-tile-meta"
                                    >
                                        <span
                                            className="block overflow-x-clip text-ellipsis whitespace-nowrap min-w-0"
                                            id="_r_1n8_"
                                            data-cds="OverflowTooltip"
                                            data-base-ui-tooltip-trigger=""
                                        >
                                            from Anthropic
                                        </span>

                                        <span aria-hidden="true">·</span>

                                        <span
                                            className="shrink-0 whitespace-nowrap"
                                            data-testid="discover-tile-fact"
                                        >
                                            <span
                                                id="_r_1na_"
                                                data-base-ui-tooltip-trigger=""
                                            >
                                                <span aria-hidden="true">8.3M installs</span>

                                                <span className="sr-only">
                                                    8,265,244 installs across all of Claude
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </div>

                                {/* Add Button */}
                                <div className="relative flex shrink-0 items-center">
                                    <button
                                        type="button"
                                        data-cds="Button"
                                        data-cds-icon-only=""
                                        className="cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0"
                                        aria-label="Add Plugin Management"
                                        id="_r_1nc_"
                                        data-base-ui-tooltip-trigger=""
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish"
                                        >
                                            <span
                                                data-cds-part="paint"
                                                className="absolute inset-0 rounded-[inherit] transition-[background-color,box-shadow,color] duration-fast ease-out group-focus-visible/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] group-[[data-initial-focus]:focus]/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] bg-fill-secondary group-hover/btn:bg-fill-secondary-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-secondary-hover group-aria-pressed/btn:bg-accent group-hover/btn:group-aria-pressed/btn:bg-accent shadow-field group-aria-pressed/btn:shadow-field-pressed group-focus-visible/btn:group-aria-pressed/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)]"
                                            />
                                        </span>

                                        <span className="inline-flex min-w-0 items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M12 5l0 14" />
                                                <path d="M5 12l14 0" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* <SortableTable columns={columns} data={departments} /> */}
                    </div>
                )}
                {!isLoading && !isError && departments.length === 0 && (
                    <div className="flex items-center justify-center flex-col text-center pt-[60px]">
                        <div className="img_area">
                            <img src="/svgviewer-output.svg" />
                        </div>
                        <h3 className="max-w-xs font-medium text-[#52514E]">Looking to start a department?</h3>
                        <p className="max-w-xs text-footnote text-[#52514E] mt-5 mb-4">Manage Designation, set custom instructions, and organize task in one space.</p>
                        <button onClick={handleDepartmentCreate} className="border border-[#0b0b0b1a] bg-white text-[#0B0B0B] px-3 py-2 rounded-[10px] text-[14px]">New Departments</button>
                    </div>
                )}


            </div>
        </div>
    );
}