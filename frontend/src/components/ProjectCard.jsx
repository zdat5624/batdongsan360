import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../assets/styles/ProjectCard.css"
const ProjectCard = ({ project }) => {
  return (
    <Link to={`/project/${project.id}`} className="text-decoration-none">
      <div className="card shadow-sm border-0">
        <img src={project.img} className="card-img-top" alt={project.title} />
        <div className="card-body">
          <h5 className="card-title">{project.title}</h5>
          <p className="text-danger mb-1">Giá: {project.price}</p>
          <p className="text-danger mb-1">Diện tích: {project.size}</p>
          <p className="text-dark">Vị trí: {project.location}</p>
        </div>
      </div>
    </Link>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProjectCard;
