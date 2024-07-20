document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //POST form to API
  document.querySelector('#compose-form').onsubmit = function(){
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector("#compose-recipients").value,
          subject: document.querySelector("#compose-subject").value,
          body: document.querySelector("#compose-body").value
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.error);
        });
      }
      return response.json();
    })
    .then(result => {
    // Print result
    console.log(result);

    })
    .catch(error => {
      alert(error)
      console.log(error)
    });
  load_mailbox('sent');
  return false;
  };
};

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Get emails from API
  emails = fetch(`/emails/${mailbox}`)
  .then(response => response.json())

  .then(emails => {
    console.log(emails)

    email_view = document.getElementById('emails-view');
    email_view.innerHTML = '';
    email_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    emails.forEach(mail => {

        const newDiv = document.createElement('div');
        newDiv.className = 'card ';
        

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.innerText = `From: ${mail.sender}`;
  
        const cardSubject = document.createElement('div');
        cardSubject.className = 'card-text';
        cardSubject.innerText = `Subject: ${mail.subject}`;

        const cardTimestamp = document.createElement('div');
        cardTimestamp.className = "card-footer text-muted";
        cardTimestamp.innerText = `Sent at: ${mail.timestamp}`;

        const cardButton = document.createElement('a');
        cardButton.className = 'btn btn-primary stretched-link';
        cardButton.innerText = 'View Email';
        cardButton.addEventListener('click', () => viewmail(mail.id));
        
        
        newDiv.appendChild(cardBody);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubject);
        cardBody.appendChild(cardButton);
        newDiv.appendChild(cardTimestamp);
        email_view.appendChild(newDiv);
        
    });
  })

  .catch(error => {
    console.log('Error:', error);
  });   
};

function viewmail(email_id) {

  email = fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then (email => {
    console.log(email)

    const modalTitle = document.getElementById('emailModalLabel')
    const modalBody = document.getElementById('email-modal-body')

    modalTitle.innerText = `Subject: ${email.subject}`
    modalBody.innerHTML = `
                <p><strong>From:</strong> ${email.sender}</p>
                <p><strong>To:</strong> ${email.recipients}</p>
                <p class="text-muted">Sent at: ${email.timestamp}</p>
                <p>${email.body}</p>
    `;
    $('#emailModal').modal('show');
  })
  .catch(error => {
    console.log('Modal Error:', error)
  });
};

