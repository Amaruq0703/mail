document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  const archiveButton = document.querySelector('#archiveButton');
  archiveButton.addEventListener('click', function() {
        const emailId = this.getAttribute('data-email-id');
        archiveEmail(emailId);
    });

  const replyButton = document.querySelector('#replyButton');
  replyButton.addEventListener('click', function() {
      const replyEmailId = this.getAttribute('data-email-id');
      replyEmail(replyEmailId);
    });
  // By default, load the inbox
  load_mailbox('inbox')
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
  document.querySelector('#compose-form').onsubmit = function(event) {
    event.preventDefault()
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector("#compose-recipients").value,
          subject: document.querySelector("#compose-subject").value,
          body: document.querySelector("#compose-body").value,
          read: false
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
    load_mailbox('sent');

    })
    .catch(error => {
      alert(error)
      console.log(error)
    });
  
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

        if (mail.read === false) {
          newDiv.addEventListener('mouseover', () => {
            newDiv.style.backgroundColor = 'lightgrey'
          })
          newDiv.addEventListener('mouseout', () => {
            newDiv.style.backgroundColor = 'white'
          })  
        } else {
          newDiv.style.backgroundColor = 'lightgrey'
        }
              

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
        cardButton.setAttribute('data-email-id', mail.id);
        cardButton.className = 'btn btn-primary stretched-link';
        cardButton.innerText = 'View Email';
        cardButton.style.opacity = '0';
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


    return fetch(`/emails/${email_id}`, {
      method: 'PUT', 
      body: JSON.stringify({ read: true })
    })
  .then(() => email);
  })

  .then(email => {
    const modalTitle = document.getElementById('emailModalLabel')
    const modalBody = document.getElementById('email-modal-body')
    const archiveButton = document.getElementById('archiveButton')
    const replyButton = document.getElementById('replyButton')

    replyButton.setAttribute('data-email-id', email.id);
    archiveButton.setAttribute('data-email-id', email.id);

    if (email.archived === true) {
      archiveButton.innerText = 'Unarchive'
    } else {
      archiveButton.innerText = 'Archive'
    }

    modalTitle.innerText = `Subject: ${email.subject}`
    modalBody.innerHTML = `
                <p><strong>From:</strong> ${email.sender}</p>
                <p><strong>To:</strong> ${email.recipients}</p>
                <p class="text-muted">Sent at: ${email.timestamp}</p>
                <p>${email.body}</p>
    `
    $('#emailModal').modal('show');
  })
  .catch(error => {
    console.log('Modal Error:', error)
  })
};

function archiveEmail(email_id) {
  archiveMail = fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then (archiveMail => {
    console.log(archiveMail)

    if (archiveMail.archived === false) {
      return fetch(`/emails/${email_id}`, {
        method: 'PUT', 
        body: JSON.stringify({ archived: true })
      }) 
    } else {
      return fetch(`/emails/${email_id}`, {
        method: 'PUT', 
        body: JSON.stringify({ archived: false })
      }); 
    };
  });
  load_mailbox('inbox')
};
  
function replyEmail(email_id) {

  email = fetch(`/emails/${email_id}`)

  .then(response => response.json())
  .then(email => {
    compose_email();

    const body = email.body;
    const subject = email.subject;
    const recipient = email.sender;
    const timestamp = email.timestamp;

    if (subject.split(" ", 1)[0] != "Re:") {
      subject = "Re: " + subject;
    }
    document.querySelector('#compose-subject').value = subject;

    document.getElementById("compose-recipients").value = recipient;
    document.getElementById("compose-body").value = `On ${timestamp} ${recipient} wrote: ${body}`;
  });
};




