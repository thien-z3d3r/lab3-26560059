import './App.css';

function App() {
  return (
    <div className="profile-card">
      <img src="/avatar.png" alt="My avatar" className="avatar" />
      <h2>Nguyen Van A</h2>
      <p className="title">Frontend Development Student</p>
      <p className="bio">
        I enjoy turning designs into interactive web pages and I'm currently learning React.
      </p>
      <div className="skills">
        <span>HTML</span>
        <span>CSS</span>
        <span>JavaScript</span>
        <span>React</span>
      </div>
    </div>
  );
}

export default App;
