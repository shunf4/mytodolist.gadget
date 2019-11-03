sub alert(prompt)
    MsgBox prompt, 48 , "My To-Do List"
end sub

function confirm(prompt)
    dim res
    res = MsgBox (prompt, 33, "My To-Do List")
    if res=1 then
        confirm = true
    else
        confirm = false
    end if
end function
