export const emailTemplates = {
  listings: {
    name: "RentalListings",
    subject: "New Rental Listings - Rental Insight",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #0b7a75; margin-top: 0;">Latest Rental Listings</h1>
          <p>Here are the newest rental properties we found:</p>
          
          {{#each listings}}
          <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; border-left: 4px solid #0b7a75;">
            <a href="{{url}}" 
              style="color: #0b7a75; 
                      text-decoration: none; 
                      font-weight: 500; 
                      font-size: 16px; 
                      display: block;">
              {{title}}
            </a>
          </div>
          {{/each}}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              You're receiving this because you subscribed to rental listing updates.
              <a href="{{unsubscribeUrl}}" 
                style="color: #0b7a75; 
                        text-decoration: underline;">
                Unsubscribe
              </a>
            </p>
          </div>
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
