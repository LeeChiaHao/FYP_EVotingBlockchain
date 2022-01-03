import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/create.css'

const App = {
    load: async () => {
        var totalCandidate = 1;
        var divCandidate
        // const a = await $.get("candidate.html")
        // console.log(a)
        // console.log($.parseHTML(a))
        $(".addCandidate").on("click", async function () {
            console.log("Num" + totalCandidate)
            if (totalCandidate == 1) {
                divCandidate = "loadCandidate" + totalCandidate
                $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate")
                $("." + divCandidate).load("candidate.html", function () {
                    App.loadClassName("." + divCandidate, totalCandidate)
                })
                totalCandidate++

            } else {
                divCandidate = "loadCandidate" + totalCandidate
                $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate" + (totalCandidate - 1))
                $("." + divCandidate).load("candidate.html", function () {
                    App.loadClassName("." + divCandidate, totalCandidate)
                })
                totalCandidate++
            }
        })
    },

    loadClassName: async (className, num) => {
        num--;
        console.log(className)
        $(className).children().each(function (index) {
            $(this).children().each(function (y) {
                if ($(this).is("label")) {
                    $(this).text("Candidate" + num)
                }
                if (y == 1) {
                    console.log($(this))
                    switch (index) {
                        case 1:
                            $(this).prop("id", "candidateName" + num)
                            break
                        case 2:
                            $(this).prop("id", "age" + num)
                            break
                        case 3:
                            $(this).prop("id", "partyName" + num)
                            break
                        case 4:
                            $(this).prop("id", "last" + num)
                            break
                        default:
                            break

                    }
                    // if (index == 1) {
                    //             $(this).prop("id", "candidateName" + num)

                    // }
                }
            })
            $(this).removeClass("candidate-group").addClass("candidate-group-" + num)

        })


        // $('div', $(className)).each(function(){
        //     console.lo
        // })
    },

}


window.App = App;
window.addEventListener("load", async function () {
    App.load()
})