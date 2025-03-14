
import SkillTester from "@/components/SkillTester";
import { useAuth } from "@/components/AuthProvider";
import { Navigate } from "react-router-dom";

const SkillTest = () => {
  const { user, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow">Loading...</div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Skill Testing Utility</h1>
      <SkillTester />
    </div>
  );
};

export default SkillTest;
