export const emailTemplates = {
  welcome: {
    name: "WelcomeEmail",
    subject: "Welcome to Rental Insight!",
    html: `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <h1>Welcome to Rental Insight!</h1>
      <p>Thanks for joining Rental Insight. We're excited to help you find your perfect housing!</p>
      <p>Your preferences have been set to:</p>
      <ul>
        <li>Price Range: {{priceRange}}</li>
        <li>Location: {{location}}</li>
        <li>Move-in Date: {{moveInDate}}</li>
      </ul>
      <p>Best regards,<br>The Rental Insight Team</p>
    </body>
    </html>
  `,
  },
  match: {
    name: "HousingMatch",
    subject: "New Housing Match Found! 🏠",
    html: `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <h1>We Found a Match!</h1>
      <p>We found a housing option that matches your preferences:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        <h2>{{propertyName}}</h2>
        <p>Price: {{price}}/month</p>
        <p>Location: {{location}}</p>
        <p>Available from: {{availableDate}}</p>
        <a href="{{propertyLink}}" style="background: #0b7a75; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Details
        </a>
      </div>
    </body>
    </html>
  `,
  },
  verification: {
    name: "EmailVerification",
    subject: "Verify Your Email - Rental Insight",
    html: `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <h1>Verify Your Email</h1>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="{{verificationLink}}" 
         style="background: #0b7a75; 
                color: white; 
                padding: 10px 20px; 
                text-decoration: none; 
                border-radius: 5px; 
                display: inline-block; 
                margin: 20px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link: {{verificationLink}}</p>
      <p>This link will expire in 24 hours.</p>
    </body>
    </html>
  `,
  },
};
