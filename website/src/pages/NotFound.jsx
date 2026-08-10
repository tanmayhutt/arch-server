import { ArrowLeft, ServerOff } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="site-page not-found-page">
    <section className="page-width not-found-panel">
      <ServerOff size={28} strokeWidth={1.4} />
      <span className="section-index">ROUTE / 404</span>
      <h1>This path is not part of the node.</h1>
      <p>The public surface is intentionally small. Return to the documented system overview.</p>
      <Link to="/" className="primary-action"><ArrowLeft size={15} /> Return to overview</Link>
    </section>
  </div>
);

export default NotFound;
