document.addEventListener("deviceready", onDeviceReady, false);

// Define the Function (aka command) that will include all our app code. 
function onDeviceReady() { 
    console.log("Cordova is ready! ");
    
    // --------------------------- VARIABLES --------------- //
    // Create Variables (Objects) for the Forms
    // NOTE: Make sure your <a href> has NO href
    // NOTE: fm prefix means <form>
    const $elFmSignUp = $("#fmSignUp"),
            $elFmLogIn = $("#fmLogIn"),
            $elBtnLogOut = $("#btnLogOut");
    /*
        To set up a Strong Feature, we can create an "example" of a strong password pattern
        to check versus what the User is entering 
        a X 1 ! > 7 
        Spider99!  !=   cat123
        Spider99!  ==   CatCode123@
        Create a pattern to match a String (text) via Regular Expressions
        
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{7,})"     = a X 1 ! > 7 
        "" - a String (text)  Phrase
        ^ - start of the pattern (line)
        (?=.*[a-z])  -  a symbol that is a - z (lowercase)
        (?=.*[A-Z])  -  a symbol that is A - Z (upercase)
        (?=.*[0-9])  - a symbol that is 0 - 9 (numbers)
        (?=.*[!@#\$%\^&\*])  - a symbol that is only ! @ # $ (\$) % ^ (\^) & * (\*) 
        (?=.{7,}) - at least 7 characters
    */
    // const is an Object hat doesn't change
    const strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{7,})");

    /*
        For Auto-Login (Remember Me) feature:
        x A way to keep track who has last logged in 
        x A way to set who has last logged in
        A way to set who logged out
        x We also need to have code run as soon as the app start,
         without User interaction
    */
    // let is an Object that let's us change it
    // var still works either way; but const/let are a bit more modern
    // When the app is new, localStoarage is null (no one has ever logged in)
    //   When the app has been used, localStorage is data (email)
    let uid = localStorage.getItem("whoIsLoggedIn");

    // Create a new PouchDB (database) object. An app can have as many as you want
    // based on space on device. This database may be connected to a server, in the future
    // MySQL is a Relational database (it connects one 'folder' of data to another)
    // PouchDB is a NOSQL style database, and is NOT a Relational Database
    // "External" name of the database is myDBofComics
    // "Internal" name of the database is adfsadsfadfsadfsadfs
    let myDBofComics = new PouchDB("adfsadsfadfsadfsadfs");

    // Variable that references the Save Comic <form> in the Save Comic screen
    const $elFmSaveComic = $("#fmSaveComic");

    // Variable for deleting the whole database
    const $elBtnDeleteCollection = $("#btnDeleteCollection");
   
   // Variable to keep track of which comic we clicked on (to view, edit, or delete) (work in progress comic)
   let comicWIP = "";

    // ------------ AUTO-LOGIN CHECKER ----------- //
    // Before any of the User interaction, have the app check, who last logged in
    // Check for this OR this OR this by using ||  (OR operator) two pipes (shift-backslash)
    // Be careful it's ""  and not " "  <- NO SPACE!
    if(uid === null || uid === undefined || uid === false || uid === "") {
        console.log("No user logged in. Keep them at #pgWelcome");
    } else {
        console.log("A user last logged in, so move them to #pgHome"); 
        console.log(uid);
        // So move them from #pgWelcome to #pgHome
        $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
        // To-do: load that user's datbase (PouchDB)
        // xx To-do: Load their first comic if saved
        fnViewComics();
        // xx To-do: Customize the app for the that user: show their email in the footer
        // Set an "anchor" in the HTML that the JavaScript can use to write their email on-screen
        // id (html) -> # (js)    hashmark
        // class (html) -> . (js) period
        $(".userEmail").html("Hello " + uid);
    } // END If..Else Auto-Login checker

    // ---------------- FUNCTIONS ------------- ///
    function fnSignUp(event) {
        // Stop the default behavior: Refresh
        event.preventDefault();
        console.log("fnSignUp(event) is running");
        // Read the <input> fields in the form
        let $elInEmailSignUp = $("#inEmailSignUp"),
            $elInPasswordSignUp = $("#inPasswordSignUp"),
            $elInPasswordConfirmSignUp = $("#inPasswordConfirmSignUp");

        // Check what you typed in the <input>
        console.log($elInEmailSignUp.val());
        console.log($elInPasswordSignUp.val());
        console.log($elInPasswordConfirmSignUp.val());

        // First, check if the password is strong
        // before we check if their passwords match
        // and before we check if account exists
        if(strongPassword.test($elInPasswordSignUp.val())) {
            console.log("Yes, password is strong, proceed");
            
                    // Compare the Password vs Password Confirm
                            // and make 'decisions' based on what we see
                            if($elInPasswordSignUp.val() != $elInPasswordConfirmSignUp.val()) { 
                                // Result of NO match
                                console.log("Passwords DO NOT MATCH");  // User does not see this
                                window.alert("Passwords DO NOT MATCH"); // User sees this
                                // Clear those fields so they try again
                                $elInPasswordSignUp.val("");
                                $elInPasswordConfirmSignUp.val("");
                            } else {
                                // Result of yes a match
                                console.log("Passwords DO match");
                                // Now check if email has been precviuosly used
                                // First read the email field and prep it
                                let $tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(),
                                    $tmpValInPasswordSignUp = $elInPasswordSignUp.val();

                                    console.log($tmpValInEmailSignUp);

                                // Check if that email has been previously saved to localStorage (our Database)  
                                if(localStorage.getItem($tmpValInEmailSignUp) === null) {
                                    // This is a new user
                                    console.log("New user detected");
                                    // so save them to the database
                                    localStorage.setItem($tmpValInEmailSignUp, $tmpValInPasswordSignUp);
                                    window.alert("Welcome!"); // Give them a success message
                                    $elFmSignUp[0].reset(); // clear the form to create a new user
                                    console.log("New user saved: " + $tmpValInEmailSignUp);
                                    // Maybe now move the user to #pgLogIn..?)
                                } else {
                                    // This is a previuos user
                                    console.log("Previous user detected");
                                } // END If..else checking if email was used 
                            } // END If..Else password matching

        } else {
            console.log("NO password is WEAK!");
            window.alert("Password not strong enough!");
            $elInPasswordSignUp.val("");
            $elInPasswordConfirmSignUp.val("");
        } // END If..Else to check if Password is strong
        // We moved last week's code INTO If..Else for Strong Password
    } // END fnSignUp(event)

    // Function to deal with loggin in
    // NOTE: NOW REMOVE YOUR DUMB BUTTON
    function fnLogIn(event) {
        event.preventDefault();
        console.log("fnLogIn(event) is running");

        // fIRST Read the input fields
        let $elInEmailLogIn = $("#inEmailLogIn"),
            $elInPasswordLogIn = $("#inPasswordLogIn"),
            $tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
            $tmpValInPasswordLogIn = $elInPasswordLogIn.val();

            console.log($tmpValInEmailLogIn);
            console.log($tmpValInPasswordLogIn);
            // Conditional statement to check if account exists
            // then if password matches
            if(localStorage.getItem($tmpValInEmailLogIn) === null) {
                console.log("Account does NOT exist");
                window.alert("You don't have an account!");
            } else {
                console.log("Account DOES exist");
                // Now check if password matches
                if($tmpValInPasswordLogIn === localStorage.getItem($tmpValInEmailLogIn)) {
                    console.log("Password match");
                    // So now move them to #pgHome
                    // This code is only relevant to jQuery Mobile 
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
                    console.log("Move them to home " + $tmpValInEmailLogIn);
                    // Now set whoIsLoggedIn
                    localStorage.setItem("whoIsLoggedIn", $tmpValInEmailLogIn);
                    // to do, show them a personlized message later
                    $(".userEmail").html("Hello " + $tmpValInEmailLogIn);
                    // to do, load their database and comics
                    fnViewComics();
                } else {
                    console.log("Passwords DON'T match");
                    window.alert("Wrong password");
                } // END If..else check if password match
            } // END If..Else check if account exists
    } // END fnLogIn(event)

    // Function to log out of the app
    function fnLogOut() {
        // Note: preventDefault() not needed
        // Check if they really want to log out
        // make a decision
        switch(window.confirm("Do you want to log out?")){
            case true: 
                console.log("They DO want to log out");
                // So move them to #pgWelcome
                $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome");
                console.log("Moved to pgWelcome");
                // And set whoIsLoggedIn to no-one
                localStorage.setItem("whoIsLoggedIn", "");
                // And clear the forms for further use
                $elFmSignUp[0].reset();
                $elFmLogIn[0].reset();
                break;
            case false:
                console.log("Don't want to log out. Keep them here");
                break;
            case "Maybe":
                console.log("They may want to log out in 10 minutes");
                break;
            default:
                // If all else fails
                console.log("Unknown respose");
                break;
        } // END swith() for log out
    } // END fnLogOut()

    // Function in charge of reading the data and preparing it for saving in fnSaveComic()
    // Note: no event OR event.preventDefault() necessary
    // because it's running from an Event Listener
    function fnPrepComic() {
        console.log("fnPrepComic() is running");

        // Read the Values in the <inputs> of that <form>
        // NOTE: $valInTitle (in PPTX) updated to $valIntitleSave (bc we're in the Save screen)
        let $valInTitleSave = $("#inTitleSave").val(),
            $valInNumberSave = $("#inNumberSave").val(),
            $valInYearSave = $("#inYearSave").val(),
            $valInPublisherSave = $("#inPublisherSave").val(),
            $valInNotesSave = $("#inNotesSave").val();

        // Why not show what's in those <inputs> before moving on? 
        console.log($valInTitleSave, $valInNumberSave, $valInYearSave, $valInPublisherSave, $valInNotesSave);

        // Now bundle that data as one JSON formatted object, to later store into PouchDB
        // and with a unique _id to differentiate one entry from another
        // the other of JSON data, does not matter, fyi
        // add .toLowerCase() to _id if you want all lowercase
        let tmpComic = {
            "_id" : $valInTitleSave.replace(/\W/g, "") + $valInYearSave + $valInNumberSave,
            "title" : $valInTitleSave,
            "number" : $valInNumberSave,
            "year": $valInYearSave,
            "publisher": $valInPublisherSave,
            "notes" : $valInNotesSave
        }; // END of JSON bundle data     .put()   .post()

        console.log(tmpComic); // Output the whole Object data stream
        console.log(tmpComic._id) // Output only one "field" of the data stream

        // Then return the bundle of data to the rest of the app
        return tmpComic;
    } // END fnPrepComic()

    // Function in charge of storing to the database
    function fnSaveComic(event) {
        event.preventDefault();
        console.log("fnSaveComic(Event) is running");

       // Get the current data in the <form> to store
       let aComic =  fnPrepComic();

       console.log("About to save this comic: " + aComic._id);

       // Save the comic into the database, and deal with success or error results
       // databasename.action(argument, [{options}], callback(err, success));
       myDBofComics.put(aComic, function(failure, success){
           // Deal with a failure or success result
           // PouchDB responded with a failure or success OBJECT (in JSON format)
           if(failure) {
               console.log("Error: " + failure.message);  
               window.alert("You already have this comic!");
           } else {
               console.log("Saved the comic: " + success.ok);
               window.alert("Comic saved!");
               // To-do: play a sound via Cordova....  
               // Clear the <form> for a new entry
               $elFmSaveComic[0].reset();
               // And refresh the veiw screen
               fnViewComics(); 
           } // END If..Else .put()

       }); // END .put()
    } // END fnSaveComic()

    // Function to get data from the database to display on-screen
    // not attached to an Event Listener (but it could be)
    // so that means it will run "on its own"
    function fnViewComics() {
        // Note: no event.preventDefault() because not attached to Listeners
        console.log("fnvewcomics() is running"); 

        // Connect to the database and start retreiving the raw data
        // We can get one item at a time via .get()
        // We can get a range of data .....
        // We can get all the data via .allDocs() 
        // There are options we can provide as we get the data
        // Sort the data as we get: ascending A - Z based on the _id
        // Also retreive the various fields we previously saved (include_docs)
        // Deal with failure or success

        myDBofComics.allDocs(
            {"ascending":true, "include_docs":true}, 
            function(failure, success){
                if(failure) {
                    // Checks if a database exists
                    console.log("Failure to get the data: " + failure.message);
                } else {
                    console.log("Getting data: " + success);
                    // Deal with if there is data or not to display
                    if(success.rows[0] === undefined) {
                        console.log("No data to display yet.");
                        $("#divViewComics").html("No comics saved, yet!");
                    } else {
                        console.log("Comics to display: " + success.rows.length);
                        console.log("First comic: " + success.rows[0].doc._id);
                        // Create a <table> of data where we have rows/columns
                        // where we can click/tap on one comic and have a popup
                        // with its details. To then edit/update/delete
                        // <th> is only for the first row: the Table Heading
                        // Start the <table>....
                        let comicData = "<table> <tr> <th>Name</th> <th>#</th> </tr>";

                        // Loop X number of times to create as many rows needed
                        // based on the number of comics in the database
                        // Using a For Loop (For Conditional Statement)
                        // for(START, END, LOOP) { sayHello(); }
                        for(let i = 0; i < success.rows.length; i++) {
                            // <td> is a plain cell (Table Data)
                            // >>>> DON'T FORGET += <<<<<
                            comicData += "<tr class='btnShowComicInfo' id='" + success.rows[i].doc._id + "'> <td>" + 
                            success.rows[i].doc.title + 
                            "</td> <td>" + success.rows[i].doc.number + "</td> </tr>";
                            // Embedd a Class to each row, so that we can click the row for a popup
                            // Embed an ID to a tie a specific row to a specific comic in the database
                            // Be careful: if you try to put Double Quotes inside Double Quotes, you'll get an error!
                            // So, alternate Double versus Single Quotes!
                            // "And then she said, 'Hello'"
                            // 'Some amount of "code"'
                        } // END For Loop

                        // Complete the </table>
                        // NOTE: += will ADD to an existing Variable/Object
                        // while = will replace anything in the Variable/Object with NEW data
                        // >>>>>>>>>>>>>>>>>>>>>>> DON'T FORGERT += <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                        comicData += "</table>";
                        // After building the table, display it onscreen
                        $("#divViewComics").html(comicData);
                    } // END if..else for data-checking
                } // END If..Else for .allDocs()
            } ); // END .allDocs()
    } // END fnViewComics()

    // TEMPORARY: WILL REMOVE LATER
    // because we'll add it to the Auto-login function
    // and to the fnLogIn()
    // and the fnSavecomic() 
    // fnViewComics();

    // Function to delete the whole database
    function fnDeleteCollection() {
        console.log("fnDeleteCollection() is running");

        // Confirm with the User that they really wish to delete everything
        if(window.confirm("Are you sure you want to delete the whole collection?")) {
            console.log("True: they wish to delete the DB");
            // To-do: Vibrate to get their attention
            // Confirm again, since this is "permanent" (IF we program in undo)
            if(window.confirm("Are you sure? There is NO undo!")) {
                console.log("They confirmed a SECOND time to delete...");
                // Then actually delete the database, deal with fail/suc, refresh the screen, feedback
                myDBofComics.destroy(function(failure, success){
                    if(failure){
                        console.log("Error deleting db: " + failure.message);
                    } else {
                        console.log("Database deleted: " + success.ok);
                        // Reinitialize the database to let User save comics anew (V1)...
                        myDBofComics = new PouchDB("mynewcomics");
                        // To-do reinitilize each user's database
                        // Refresh the View Comics sceen
                        fnViewComics();
                        window.alert("All comics are gone!");
                        // To-do: play a sound   sadtrombone.wav
                    } // END If..Else .destroy()
                }); // END .destroy()
            } else {
                console.log("On second thought, NO delete");
            } // END If..Else second confirm deletion
        } else {
            console.log("False: they chose not to delete the DB");
        } // END If..Else to confirm deletion
    } // END fnDeleteCollection()

    // Function to make the Info <section> popup to edit/view/delete a comic
    function fnEditComic(thisComic) {
        // Console output that displays the id='amazing3001988'
        console.log("fnEditComic() is running: " + thisComic.context.id);

        // Retrieve the all the data of the specific comic we clicked, to show on-screen
        myDBofComics.get(thisComic.context.id, function(failure, success){
            if(failure) {
                console.log("Error getting comic: " + failure.message);
            } else {
                console.log("Success getting comic: " + success.title);
                // Populate the <form> waiting for us, and then make the popup happen
                $("#inTitleEdit").val(success.title);
                $("#inNumberEdit").val(success.number);
                $("#inYearEdit").val(success.year);
                $("#inPublisherEdit").val(success.publisher);
                $("#inNotesEdit").val(success.notes);
                // Set comicWIP to the this one we're working on
                comicWIP = success._id;
            } // END .If..Else .get()
            // This Function populates the <section> and makes it popup
            // but updating the entries is handled by fnEditComicConfirm()
        }); // END .get()

        // Finally, make the popup appear! 
        $(":mobile-pagecontainer").pagecontainer("change", "#pgComicViewEdit", {"role" : "dialog"});
    } // END fnEditComic()

    // Function to confirm updating a comic
    function fnEditComicConfirm(event) {
        event.preventDefault();
        console.log("fnEditComicConfirm() is running");
        // Read all the <inputs> whether they changed or not, to resave to the Dabatase
        let $valInTitleEdit = $("#inTitleEdit").val(),
            $valInNumberEdit = $("#inNumberEdit").val(),
            $valInYearEdit = $("#inYearEdit").val(),
            $valInPublisherEdit = $("#inPublisherEdit").val(),
            $valInNotesEdit = $("#inNotesEdit").val();

        // Get the current entry (revision) from the database to replace it with a new entry (revision)
        // We need to use the comicWIP, which was set in fnEditComic() bc $(this) is now something else
        myDBofComics.get(comicWIP, function(failure, success){
            if(failure) {
                console.log("Error: " + failure.message);
            } else {
                console.log("About to update " + success._id, success._rev);
                // Resave any unchagned data and changed data, and set a new Revision (_rev)
                myDBofComics.put(
                    {
                        "_id" : success._id,
                        "title" : $valInTitleEdit,
                        "number" : $valInNumberEdit,
                        "year" : $valInYearEdit,
                        "publisher" : $valInPublisherEdit,
                        "notes" : $valInNotesEdit,
                        "_rev" : success._rev
                    }, 
                    function(failure, success){
                        if(failure) {
                            console.log("Error: " + failure.message);
                        } else {
                            console.log("Updated Comic: " + success.id, success.rev);
                            // Update pgViewComics
                            fnViewComics();
                            // Close the popup
                            $("#pgComicViewEdit").dialog("close");
                        } // END If..else .put
                    }); // END .put()
            } // END If..Else .get()
        }); // END .get()
    } // END fnEditComicConfirm

    // Function to delete one comic
    function fnEditComicDelete() {
        console.log("fnEditComicDelete() is running");
        // First load that comic from the database, then confirm deletion from the user, then delete, then cleanup
        myDBofComics.get(comicWIP, function(failure, success){
            if(failure) {
                console.log("Error: " + failure.message);
            } else {
                console.log("About to delete: " + success._id);
                // First confirm
                if(window.confirm("Are you sure you want to delete this comic? ")) {
                    console.log("Confirmed deletion");
                    // Remove the entry from the database
                    myDBofComics.remove(success, function(failure, success){
                            if(failure) {
                                console.log("Error: " + failure.message);
                            } else {
                                console.log("Deleted comic: " + success.ok);
                                fnViewComics();
                                $("#pgComicViewEdit").dialog("close");
                            } // END If..else .remove()
                    }); // END .remove()
                } else {
                    console.log("Canceled deletion");
                } // END .confirm()
            } // END If..else .get()
        }); // END .get()
    } // END fnEditComicDelete()

    // Function to cllose the view/info/edit popup
    function fnEditComicCancel() {
        console.log("fnEditComicCancel() is running");
        $("#pgComicViewEdit").dialog("close");
    } // END fneditcomicancel

    // --------------------- EVENT LISTENER --------------- //
    // Create Event Listeners for detect clicks
    // NOTE: fn prefix means function()
    // Note: ignore the Deprecated maker for the moement. Code still works!
    $elFmSignUp.submit( function(){ fnSignUp(event); } );
    $elFmLogIn.submit( function(){ fnLogIn(event); } );
    // Note: this listener is slighlty different
    // because it's not part of a form
    $elBtnLogOut.on("click", fnLogOut);
    $elFmSaveComic.submit( function(){ fnSaveComic(event); } );
    // aka $elFmSaveComic.on("submit", function(){ fnSaveComic(Event); } );
    // Listenever for the plain old button (not a <form>)
    $elBtnDeleteCollection.on("click", fnDeleteCollection);

    // Listener to detect which comic we clicked on, and open the popup
    // NOTE: New syntax! Because it has to deal with dynamic content (that doesn't exist at runtime)
    // $("#divViewComics") means, pay attention to a <div> that exists
    // tr means <tr>     //      .btnShowComicInfo means class='btnShowComicInfo'
    // ^-- means pay attention the dynamic row that may or may not exist
    // And pass along the id="amazingman011999" to the waiting function
    // $(this) is what you last clicked on (all the details/properties of what you clicked on)
    $("#divViewComics").on("click", "tr.btnShowComicInfo", function(){ fnEditComic($(this)); });

    // Listen for clicking Update <input> in the <form> after it's populated and popsup
    $("#fmEditComicInfo").submit( function(){ fnEditComicConfirm(event); } );

    // Listen for deleting one comic; notice: a simple <input> so syntax to match
    $("#btnDeleteComic").on("click", fnEditComicDelete);

    // Listen for closing the edit popup
    $("#btnEditComicCancel").on("click", fnEditComicCancel);
} // END onDeviceReady()