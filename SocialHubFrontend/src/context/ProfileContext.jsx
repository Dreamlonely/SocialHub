const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    avatar: '',
  });

  const updateProfile = (newProfileData) => {
    setProfile((prev) => ({ ...prev, ...newProfileData }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
export default ProfileContext;