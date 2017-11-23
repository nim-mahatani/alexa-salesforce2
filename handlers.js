"use strict";

let salesforce = require("./salesforce");

exports.SearchHouses = (slots, session, response) => {
    session.attributes.stage = "ask_city";
    response.ask("OK, in what city?");
};

exports.AnswerCity = (slots, session, response) => {
    if (session.attributes.stage === "ask_city") {
        session.attributes.city = slots.City.value;
        session.attributes.stage = "ask_bedrooms";
        response.ask("How many bedrooms?");
    } else {
        response.say("Sorry, I didn't understand that");
    }
};

exports.AnswerNumber = (slots, session, response) => {
    if (session.attributes.stage === "ask_bedrooms") {
        session.attributes.bedrooms = slots.NumericAnswer.value;
        session.attributes.stage = "ask_price";
        response.ask("Around what price?");
    } else if (session.attributes.stage === "ask_price") {
        let price = slots.NumericAnswer.value;
        session.attributes.price = price;
        let priceMin = price * 0.8;
        let priceMax = price * 1.2;
        salesforce.findProperties({city: session.attributes.city, bedrooms: session.attributes.bedrooms, priceMin: priceMin, priceMax: priceMax})
            .then(properties => {
                if (properties && properties.length>0) {
                    let text = `OK, here is what I found for ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around $${price}: `;
                    properties.forEach(property => {
                        text += `${property.get("Address__c")}, ${property.get("City__c")}: $${property.get("Price__c")}. <break time="0.5s" /> `;
                    });
                    response.say(text);
                } else {
                    response.say(`Sorry, I didn't find any ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around ${price}.`);
                }
            })
            .catch((err) => {
                console.error(err);
                response.say("Oops. Something went wrong");
            });
    } else {
        response.say("Sorry, I didn't understand that");
    }
};

exports.Changes = (slots, session, response) => {
    salesforce.findPriceChanges()
        .then(priceChanges => {
            let text = "OK, here are the recent price changes: ";
            priceChanges.forEach(priceChange => {
                    let property = priceChange.get("Parent");
                    text += `${property.Address__c}, ${property.City__c}.<break time="0.2s"/>
                            Price changed from $${priceChange.get("OldValue")} to $${priceChange.get("NewValue")}.<break time="0.5s"/>`;
            });
           response.say(text);
        })
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};
    exports.newCase = (slots, session, response) => {
        response.say("OK, let's create a new case, What is the case subject?");   
    };
    
    exports.newCaseSubject = (slots, session, response) => {
           session.attributes.subject = slots.casesubject.value;
           response.say("OK, I got the subject. What is the case description?");
    };
    
    exports.newCaseDescription = (slots, session, response) => {
           session.attributes.description = slots.casedescription.value;
           response.say("OK, Description is received. What is the case priority?");
    };
    
    exports.newCasePriority = (slots, session, response) => {
           session.attributes.priority = slots.casepriority.value;
           response.say("OK, The priority is " + slots.casepriority.value + ". What is the reason for raising this case?");
    };
    
    exports.newCaseReason = (slots, session, response) => {
           session.attributes.reason = slots.casereason.value;
           
           salesforce.createNewCase({subject: session.attributes.subject, description: session.attributes.description, priority: session.attributes.priority, reason: session.attributes.reason})
                .then(cases => {
                        let text = "Case has been created ";
                             response.say(text);      
                    })
                    .catch((err) => {
                        console.error(err);
                        response.say("Oops. Something went wrong");
                    });
    };

exports.newLead = (slots, session, response) => {
        response.say("OK, let's create a new lead, What is the lead's full name?");   
    };

    exports.newLeadName = (slots, session, response) => {
           session.attributes.leadfirstname = slots.newLeadFirstName.value;
           session.attributes.leadlastname = slots.newLeadLastName.value;
           response.say("OK, Lead's name is "+slots.newLeadFirstName.value+" "+slots.newLeadLastName.value+". What is the name of the Lead's Company?");
    };

    exports.newLeadCompany = (slots, session, response) => {
           session.attributes.companyname = slots.newLeadCompanyName.value;
           salesforce.createLead({firstname: session.attributes.leadfirstname, lastname: session.attributes.leadlastname, company: session.attributes.companyname})
                .then(leads => {
                        let text = "Lead has been created ";
                             response.say(text);      
                    })
                    .catch((err) => {
                        console.error(err);
                        response.say("Oops. Something went wrong");
                    });
    };
    exports.orderStatus = (slots, session, response) => {
           session.attributes.ordernum = slots.ordernumber.value;
            salesforce.checkOrderStatus({ordernumber: session.attributes.ordernum})
                .then(orders => {
                    let text = "Your order with Tracking Number ";
                    console.log(orders);
                    orders.forEach(order => {
                        console.log(order);
                        let corder = orders.get("Parent");
                        console.log(corder);
                        text += `${corder.Tracking_Number__c} is ${corder.Shipping_Status__c}.`;
                    });
                   console.log(text);
                   response.say(text);
                })
                    .catch((err) => {
                        console.error(err);
                        response.say("Oops. Something went wrong");
                    });
    };
