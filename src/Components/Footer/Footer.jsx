import "./Footer.css"

const Footer = () => {
    return (
        <div className="footer">
            <h4>&copy; 2025 - Designed & Built by Axel Bergquist</h4>
            <div className="Contact" id="contact">
        <div className="ext-links">
           
          <a
            href="https://www.linkedin.com/in/axel-bergquist-360940114/"
            target="_blank"
          >
            <img src="LI-In-Bug.png" alt="" />
          </a>
          <a href="https://github.com/axelberk" target="_blank">
            <img src="github-mark.png" alt="" />
          </a>
          <a href="mailto:axel.bergquist94@gmail.com">
            <img src="icon-gmail.png" alt="" />
          </a>
        </div>
      </div>
        </div>
        
    )
}

export default Footer