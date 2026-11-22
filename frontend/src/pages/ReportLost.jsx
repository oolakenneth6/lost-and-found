import "../ReportForms.css";
import React, { useState } from "react";

function ReportLost() {
  
  const [formData, setFormData] = useState({
  title: "",
  category: "",
  location: "",
  date: "",
  description: "",
  photo: null,
});

  const handleChange = (e) => {
  const { name, value, files } = e.target;

  setFormData({
    ...formData,
    [name]: name === "photo" ? files[0] : value,
  });
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5001/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        type: "lost",
        user_id: 1,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to submit report");
    }

    alert("Lost item report saved successfully!");

    console.log(result);

  } catch (error) {
    console.error(error);
    alert("Could not save report. Please try again.");
  }
};

  return (
    <div className="report-container">
      <h1>Report a Lost Item</h1>
      <p>Tell us about the item you have lost on campus.</p>

      <form onSubmit={handleSubmit}>
        <label>Item Name</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter item name"
          required
        />

        <br /><br />

        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select category</option>
          <option>Electronics</option>
          <option>Documents</option>
          <option>Keys</option>
          <option>Bags</option>
          <option>Clothing</option>
          <option>Other</option>
        </select>

        <br /><br />

        
<label>Campus Location</label>
<select
  name="location"
  value={formData.location}
  onChange={handleChange}
  required
>
  <option value="">Select campus location</option>
  <option value="Hamu Mukasa Library">Hamu Mukasa Library</option>
  <option value="N5B">N5B</option>
  <option value="Touch of Class Restaurant">Touch of Class Restaurant</option>
  <option value="Premium Hostel">Premium Hostel</option>
  <option value="Other">Other</option>
</select>



        <br /><br />

        <label>Date Lost</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <br /><br />

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your lost item"
          required
        />

        <br /><br />
        <label>Upload Item Photo (Optional)</label>
        <input
        type="file"
        accept="image/*"
        name="photo"
        onChange={handleChange}
        />

        <button type="submit">Submit Lost Report</button>
      </form>
    </div>
  );
}

export default ReportLost;