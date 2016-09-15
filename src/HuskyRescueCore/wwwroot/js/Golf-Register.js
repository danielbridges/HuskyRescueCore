﻿
var paypalButton = document.querySelector('.paypal-button');

braintree.client.create({
    authorization: $('#clientToken').val()
},
function (err, clientInstance) {
    // Creation of any other components...

    braintree.dataCollector.create({
        client: clientInstance,
        kount: true
    }, function (err, dataCollectorInstance) {
        if (err) {
            // Handle error in creation of data collector
            return;
        }
        // At this point, you should access the dataCollectorInstance.deviceData value and provide it
        // to your server, e.g. by injecting it into your form as a hidden input.
        var deviceData = dataCollectorInstance.deviceData;
        $('#BrainTreePayment_DeviceData').val(deviceData);
    });

    braintree.hostedFields.create({
        client: clientInstance,
        styles: {
            'input': {
                'font-size': '14pt'
            },
            'input.invalid': {
                'color': 'red'
            },
            'input.valid': {
                'color': 'green'
            }
        },
        fields: {
            number: {
                selector: '#card-number',
                placeholder: '4111 1111 1111 1111'
            },
            cvv: {
                selector: '#cvv',
                placeholder: '123'
            },
            expirationDate: {
                selector: '#expiration-date',
                placeholder: '10 / 2019'
            }
        }
    }, function (hostedFieldsErr, hostedFieldsInstance) {
        if (hostedFieldsErr) {
            // Handle error in Hosted Fields creation
            return;
        }

        //submit.removeAttribute('disabled');

        document.getElementById('golfRegisterForm').addEventListener('submit', function (event) {
            event.preventDefault();

            hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                if (tokenizeErr) {
                    // Handle error in Hosted Fields tokenization
                    return;
                }

                // Put `payload.nonce` into the `payment-method-nonce` input, and then
                // submit the form. Alternatively, you could send the nonce to your server
                // with AJAX.
                document.querySelector('input[name="BrainTreePayment.Nonce"]').value = payload.nonce;

                $('#golfRegisterForm').submit();
            });
        }, false);
    });

    // Create a PayPal component.
    braintree.paypal.create({
        client: clientInstance
    }, function (paypalErr, paypalInstance) {

        // Stop if there was a problem creating PayPal.
        // This could happen if there was a network error or if it's incorrectly
        // configured.
        if (paypalErr) {
            console.error('Error creating PayPal:', paypalErr);
            return;
        }

        // Enable the button.
        paypalButton.removeAttribute('disabled');

        // When the button is clicked, attempt to tokenize.
        paypalButton.addEventListener('click', function (event) {

            // Because tokenization opens a popup, this has to be called as a result of
            // customer action, like clicking a button—you cannot call this at any time.
            paypalInstance.tokenize({
                flow: 'vault'
            }, function (tokenizeErr, payload) {

                // Stop if there was an error.
                if (tokenizeErr) {
                    if (tokenizeErr.type !== 'CUSTOMER') {
                        console.error('Error tokenizing:', tokenizeErr);
                    }
                    return;
                }

                // Tokenization succeeded!
                paypalButton.setAttribute('disabled', true);
                console.log('Got a nonce! You should submit this to your server.');
                console.log(payload.nonce);
                document.querySelector('input[name="BrainTreePayment.Nonce"]').value = payload.nonce;
            });

        }, false);

    });
});

function PaymentType() {
    var paymentType = $('select[name="BrainTreePayment.PaymentMethod"]').val();

    switch (paymentType) {
        case '0':
            $('#paypalrow').show();
            $('#creditcardrow').hide();
            break;
        case '1':
            $('#paypalrow').hide();
            $('#creditcardrow').show();
            break;
    }
}

$('select[name="BrainTreePayment.PaymentMethod"]').change(PaymentType);
PaymentType();


function UpdatePayeeList() {
    UpdateAmountDue();

    var inputName = $(this).prop('id');
    var playerNumber = parseInt(inputName.charAt(8));

    var firstNameInput = $('#Attendee' + (playerNumber) + 'FirstName');
    var lastNameInput = $('#Attendee' + (playerNumber) + 'LastName');
    var AddressStreet1Input = $('#Attendee' + (playerNumber) + 'AddressStreet1');
    var AddressCityInput = $('#Attendee' + (playerNumber) + 'AddressCity');
    var AddressStateIdInput = $('#Attendee' + (playerNumber) + 'AddressStateId');
    var AddressPostalCodeInput = $('#Attendee' + (playerNumber) + 'AddressPostalCode');
    var EmailAddressInput = $('#Attendee' + (playerNumber) + 'EmailAddress');
    var PhoneNumberInput = $('#Attendee' + (playerNumber) + 'PhoneNumber');
    var TypeInput = $('#Attendee' + (playerNumber) + 'Type');

    var playerListSelectOptions = $('#payeelist option');

    // check if the option is already there
    var exists = false;
    playerListSelectOptions.each(function () {
        if (parseInt(this.value) === playerNumber) {
            exists = true;
            return false;
        }
    });

    // either name input has value
    if (firstNameInput.val() !== '' || lastNameInput.val() !== '') {
        if (!exists) {
            var newOption = '<option value="' + playerNumber + '">' + firstNameInput.val() + ' ' + lastNameInput.val() + '</option>';
            $('#payeelist').append(newOption);
        } else {
            $('#payeelist option[value=\'' + playerNumber + '\']').text(firstNameInput.val() + ' ' + lastNameInput.val());
        }

        if (playerNumber > 1) {
            // set fields required
            $(firstNameInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": first name required" }
            });
            $(lastNameInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": last name required" }
            });
            $(AddressStreet1Input).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": address street 1 required" }
            });
            $(AddressCityInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": address city required" }
            });
            $(AddressStateIdInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": address state required" }
            });
            $(AddressPostalCodeInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": address postal code required" }
            });
            $(EmailAddressInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": email address required" }
            });
            $(PhoneNumberInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": phone number required" }
            });
            $(TypeInput).rules("add", {
                required: true,
                messages: { required: "attendee #" + playerNumber + ": type of attendance required" }
            });
        }
    }
    else {
        // remove existing option if no name provided
        if (exists) {
            $('#payeelist option[value=\'' + playerNumber + '\']').remove();
        }

        // set fields not required
        if (playerNumber > 1) {
            $(firstNameInput).rules('remove', 'required');
            $(lastNameInput).rules('remove', 'required');
            $(AddressStreet1Input).rules('remove', 'required');
            $(AddressCityInput).rules('remove', 'required');
            $(AddressStateIdInput).rules('remove', 'required');
            $(AddressPostalCodeInput).rules('remove', 'required');
            $(EmailAddressInput).rules('remove', 'required');
            $(PhoneNumberInput).rules('remove', 'required');
            $(TypeInput).rules('remove', 'required');
        }
    }
}

function PopulatePaymentInformation() {
    var playerList = $('#payeelist');
    var selectedPlayer = playerList.val();

    if (parseInt($('#payeelist').val()) >= 0) {
        var firstName = $('#Attendee' + selectedPlayer + 'FirstName').val();
        var lastName = $('#Attendee' + selectedPlayer + 'LastName').val();
        var street1 = $('#Attendee' + selectedPlayer + 'AddressStreet1').val();
        var street2 = $('#Attendee' + selectedPlayer + 'AddressStreet2').val();
        var stateId = $('#Attendee' + selectedPlayer + 'AddressStateId').val();
        var city = $('#Attendee' + selectedPlayer + 'AddressCity').val();
        var zip = $('#Attendee' + selectedPlayer + 'AddressPostalCode').val();
        //var email = $('#Attendee' + selectedPlayer + 'EmailAddress').val();

        $('#BrainTreePayment_PayeeFirstName').val(firstName);
        $('#BrainTreePayment_PayeeLastName').val(lastName);
        $('#BrainTreePayment_PayeeAddressStreet1').val(street1);
        $('#BrainTreePayment_PayeeAddressStreet2').val(street2);
        $('#BrainTreePayment_PayeeAddressStateId').val(stateId);
        $('#BrainTreePayment_PayeeAddressCity').val(city);
        $('#BrainTreePayment_PayeeAddressPostalCode').val(zip);
        //$('#PayeeEmailAddress').val(email);
    } else {
        $('#PayeeFirstName').val('');
        $('#PayeeLastName').val('');
        $('#PayeeAddressStreet1').val('');
        $('#PayeeAddressStreet2').val('');
        $('#PayeeAddressStateId').val('');
        $('#PayeeAddressCity').val('');
        $('#PayeeAddressPostalCode').val('');
        $('#PayeeEmailAddress').val('');
    }
}

function UpdateAmountDue() {
    var amountdue = 0;
    var golfTicketCost = parseInt($('#GolfTicketCost').val());
    var banquetTicketCost = parseInt($('#BanquetTicketCost').val());
    if ($('#Attendee1FirstName').val()) {
        switch ($('input[name="Attendee1Type"]:checked').val()) {
            case '0':
                amountdue += golfTicketCost;
                $('#Attendee1TicketPrice').val(golfTicketCost);
                break;
            case '1':
                amountdue += banquetTicketCost;
                $('#Attendee1TicketPrice').val(banquetTicketCost);
                break;
        }
    }
    if ($('#Attendee2FirstName').val()) {
        switch ($('input[name="Attendee2Type"]:checked').val()) {
            case '0':
                amountdue += golfTicketCost;
                $('#Attendee2TicketPrice').val(golfTicketCost);
                break;
            case '1':
                amountdue += banquetTicketCost;
                $('#Attendee2TicketPrice').val(banquetTicketCost);
                break;
        }
    }
    if ($('#Attendee3FirstName').val()) {
        switch ($('input[name="Attendee3Type"]:checked').val()) {
            case '0':
                amountdue += golfTicketCost;
                $('#Attendee3TicketPrice').val(golfTicketCost);
                break;
            case '1':
                amountdue += banquetTicketCost;
                $('#Attendee3TicketPrice').val(banquetTicketCost);
                break;
        }
    }
    if ($('#Attendee4FirstName').val()) {
        switch ($('input[name="Attendee4Type"]:checked').val()) {
            case '0':
                amountdue += golfTicketCost;
                $('#Attendee4TicketPrice').val(golfTicketCost);
                break;
            case '1':
                amountdue += banquetTicketCost;
                $('#Attendee4TicketPrice').val(banquetTicketCost);
                break;
        }
    }

    $('#TotalAmountDueReadOnly').val(parseInt(amountdue));
    $('#TotalAmountDue').val(parseInt(amountdue));
}

// assign functions to events
for (var i = 1; i <= 4; i++) {
    var firstNameInput = $('#Attendee' + (i) + 'FirstName');
    var lastNameInput = $('#Attendee' + (i) + 'LastName');
    var attendeeType = $('input[name="Attendee' + (i) + 'Type"]:radio');
    firstNameInput.on('change', UpdatePayeeList);
    lastNameInput.on('change', UpdatePayeeList);
    attendeeType.on('change', UpdateAmountDue);
}

$('#payeelist').on('change', PopulatePaymentInformation);
UpdateAmountDue();
document.getElementById('Attendee1FirstName').focus();

