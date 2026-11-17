export default function Loading() {
  return (
    <div>
      <div className="skel" style={{ height: 34, width: 260, marginBottom: 18 }} />
      <div className="grid cols-4" style={{ marginBottom: 16 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 88 }} />)}</div>
      <div className="grid cols-2"><div className="skel" style={{ height: 300 }} /><div className="skel" style={{ height: 300 }} /></div>
    </div>
  );
}
