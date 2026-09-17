import { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [projectId, setProjectId] = useState(null);

  return (
    <ProjectContext.Provider
      value={{
        userId,
        setUserId,
        projectId,
        setProjectId,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  return useContext(ProjectContext);
};