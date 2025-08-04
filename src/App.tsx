import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import LawyerList from "@/pages/LawyerList";
import LawyerDetail from "@/pages/LawyerDetail";
import ConsultationBooking from "@/pages/ConsultationBooking";
import UserCenter from "@/pages/UserCenter";
import About from "@/pages/About";
import ConsultationRoom from "@/pages/ConsultationRoom";
import Specialties from "@/pages/Specialties";
import Consultation from "@/pages/Consultation";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lawyers" element={<LawyerList />} />
        <Route path="/lawyers/:id" element={<LawyerDetail />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/consultation/book/:id" element={<ConsultationBooking />} />
        <Route path="/consultation/room/:id" element={<ConsultationRoom />} />
        <Route path="/consultations" element={<UserCenter />} />
        <Route path="/profile" element={<UserCenter />} />
        <Route path="/user/consultations" element={<UserCenter />} />
        <Route path="/user/profile" element={<UserCenter />} />
        <Route path="/user/settings" element={<UserCenter />} />
        <Route path="/specialties" element={<Specialties />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}
