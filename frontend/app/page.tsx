import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import CodeEditor from "@/components/editor/CodeEditor";
import OutputPanel from "@/components/output/OutputPanel";

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex overflow-hidden">
          <CodeEditor />
          <OutputPanel />
        </div>
      </div>
    </main>
  );
}
