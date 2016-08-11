//model

var m_selection = {}

//controller

function sel_init() {
    m_selection["selection"] = null;
    m_selection["sidebar"] = document.getElementById("sel_bar");
    m_selection["titles"] = document.getElementById("sel_titles");
    m_selection["unique_in"] = document.getElementById("unique_in");
    m_selection["unique_out"] = document.getElementById("unique_out");
    m_selection["unique_ports"] = document.getElementById("unique_ports");
    m_selection["conn_in"] = document.getElementById("conn_in");
    m_selection["conn_out"] = document.getElementById("conn_out");
    m_selection["ports_in"] = document.getElementById("ports_in");
}

function sel_set_selection(node) {
    m_selection["selection"] = node;
    sel_clear_display();

    if (node !== null && node["details"]["loaded"] === false) {
        // load details
        m_selection["titles"].firstChild.innerHTML = "Loading selection..."
        getDetails(node, sel_update_display);
    } else {
        sel_update_display();
    }
}

// view

function sel_clear_display() {
    removeChildren(m_selection["titles"]);
    //removeChildren(m_selection["conn_in"]);
    m_selection["conn_in"].innerHTML = "";
    //removeChildren(m_selection["conn_out"]);
    m_selection["conn_out"].innerHTML = "";
    //removeChildren(m_selection["ports_in"]);
    m_selection["ports_in"].innerHTML = "";
    m_selection["unique_in"].childNodes[0].textContent = "0";
    m_selection["unique_out"].childNodes[0].textContent = "0";
    m_selection["unique_ports"].childNodes[0].textContent = "0";

    var overflow = m_selection["conn_in"].nextElementSibling;
    overflow.innerHTML = "";
    overflow = m_selection["conn_out"].nextElementSibling;
    overflow.innerHTML = "";
    overflow = m_selection["ports_in"].nextElementSibling;
    overflow.innerHTML = "";


    var h4 = document.createElement("h4");
    h4.appendChild(document.createTextNode("No selection"));
    m_selection["titles"].appendChild(h4);
    m_selection["titles"].appendChild(document.createElement("h5"));
}

function sel_update_display(node) {
    if (node === undefined) {
        node = m_selection["selection"]
    }
    if (node === null) {
        return
    }
    var tr;
    var th;
    var td;
    var h4;
    var h5;
    var a;
    var table;
    var tbody;
    var overflow;
    var div;
    var input;

    //clear all data
    removeChildren(m_selection["titles"]);
    //removeChildren(m_selection["conn_in"]);
    table = m_selection["conn_in"].parentElement;
    overflow = m_selection["conn_in"].nextElementSibling;
    table.removeChild(m_selection["conn_in"]);
    tbody = document.createElement("tbody");
    m_selection["conn_in"] = tbody;
    table.insertBefore(tbody, overflow);
    //removeChildren(m_selection["conn_out"]);
    table = m_selection["conn_out"].parentElement;
    overflow = m_selection["conn_out"].nextElementSibling;
    table.removeChild(m_selection["conn_out"]);
    tbody = document.createElement("tbody");
    m_selection["conn_out"] = tbody;
    table.insertBefore(tbody, overflow);
    //removeChildren(m_selection["ports_in"]);
    table = m_selection["ports_in"].parentElement;
    overflow = m_selection["ports_in"].nextElementSibling;
    table.removeChild(m_selection["ports_in"]);
    tbody = document.createElement("tbody");
    m_selection["ports_in"] = tbody;
    table.insertBefore(tbody, overflow);

    //fill the title div
    h4 = document.createElement("h4");
    div = document.createElement("div");
    input = document.createElement("input");
    input.id = "node_alias_edit";
    input.type = "text";
    input.placeholder = "Node Alias";
    input.style.textAlign = "center";
    input.value = get_node_name(node);
    input.onkeyup = node_alias_submit;
    input.onblur = node_alias_submit;
    a = document.createElement("i");
    a.classList.add("write");
    a.classList.add("icon");
    div.classList.add("ui");
    div.classList.add("transparent");
    div.classList.add("icon");
    div.classList.add("input");
    div.appendChild(input);
    div.appendChild(a);
    h4.appendChild(div);
    m_selection["titles"].appendChild(h4);
    h5 = document.createElement("h5");
    h5.appendChild(document.createTextNode(get_node_address(node)));
    m_selection["titles"].appendChild(h5);

    //fill in the section titles
    m_selection["unique_in"].childNodes[0].textContent = node.details["unique_in"].toString();
    m_selection["unique_out"].childNodes[0].textContent = node.details["unique_out"].toString();
    m_selection["unique_ports"].childNodes[0].textContent = node.details["unique_ports"].toString();

    //fill in the tables
    //Input Connections table
    tbody = document.createElement("tbody");
    node.details["conn_in"].forEach(function (connection) {
        tr = document.createElement("tr");
        td = document.createElement("td");
        td.rowSpan = connection[1].length;
        td.appendChild(document.createTextNode(connection[0]));
        tr.appendChild(td);
        connection[1].forEach(function (port) {
            td = document.createElement("td");;
            a = document.createElement("a");
            a.onclick = port_click;
            if (port_loaded(port.port)) {
                a.appendChild(document.createTextNode(get_port_name(port.port)));
                a.setAttribute("data-content", get_port_description(port.port));
                a.setAttribute("class", "popup");
            } else {
                a.appendChild(document.createTextNode(port.port.toString()));
            }
            td.appendChild(a);
            tr.appendChild(td);
            td = document.createElement("td");
            td.appendChild(document.createTextNode(port.links.toString()));
            tr.appendChild(td);
            tbody.appendChild(tr)
            tr = document.createElement("tr");
        });
    });
    table = m_selection["conn_in"].parentElement;
    overflow = m_selection["conn_in"].nextElementSibling;
    table.removeChild(m_selection["conn_in"]);
    m_selection["conn_in"] = tbody;
    table.insertBefore(tbody, overflow);


    //Output Connections table
    tbody = document.createElement("tbody");
    node.details["conn_out"].forEach(function (connection) {
        tr = document.createElement("tr");
        td = document.createElement("td");
        td.rowSpan = connection[1].length;
        td.appendChild(document.createTextNode(connection[0]));
        tr.appendChild(td);
        connection[1].forEach(function (port) {
            td = document.createElement("td");
            a = document.createElement("a");
            a.onclick = port_click;
            if (port_loaded(port.port)) {
                a.appendChild(document.createTextNode(get_port_name(port.port)));
                a.setAttribute("data-content", get_port_description(port.port));
                a.setAttribute("class", "popup");
            } else {
                a.appendChild(document.createTextNode(port.port.toString()));
            }
            td.appendChild(a);
            tr.appendChild(td);
            td = document.createElement("td");
            td.appendChild(document.createTextNode(port.links.toString()));
            tr.appendChild(td);
            tbody.appendChild(tr)
            tr = document.createElement("tr");
        });
    });
    table = m_selection["conn_out"].parentElement;
    overflow = m_selection["conn_out"].nextElementSibling;
    table.removeChild(m_selection["conn_out"]);
    m_selection["conn_out"] = tbody;
    table.insertBefore(tbody, overflow);


    //Ports Accessed table
    tbody = document.createElement("tbody");
    node.details["ports_in"].forEach(function (port) {
        tr = document.createElement("tr");
        td = document.createElement("td");
        a = document.createElement("a");
        a.onclick = port_click;
        if (port_loaded(port.port)) {
            a.appendChild(document.createTextNode(get_port_name(port.port)));
            a.setAttribute("data-content", get_port_description(port.port));
            a.setAttribute("class", "popup");
        } else {
            a.appendChild(document.createTextNode(port.port.toString()));
        }
        td.appendChild(a);
        tr.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(port.links.toString()));
        tr.appendChild(td);
        tbody.appendChild(tr);
    });
    table = m_selection["ports_in"].parentElement;
    overflow = m_selection["ports_in"].nextElementSibling;
    table.removeChild(m_selection["ports_in"]);
    m_selection["ports_in"] = tbody;
    table.insertBefore(tbody, overflow);

    //fill in the overflow table footer for connections in
    overflow = m_selection["conn_in"].nextElementSibling;
    removeChildren(overflow);
    var overflow_text;
    var overflow_amount = node.details["unique_in"] - node.details["conn_in"].length;
    if (overflow_amount > 0) {
        overflow_text = "Plus " + overflow_amount + " more...";
        tr = document.createElement("tr");
        th = document.createElement("th");
        th.appendChild(document.createTextNode(overflow_text));
        tr.appendChild(th);
        th = document.createElement("th");
        th.colSpan = 2;
        tr.appendChild(th);
        overflow.appendChild(tr);
    }

    //fill in the overflow table footer for connections out
    overflow = m_selection["conn_out"].nextElementSibling;
    removeChildren(overflow);
    overflow_amount = node.details["unique_out"] - node.details["conn_out"].length;
    if (overflow_amount > 0) {
        overflow_text = "Plus " + overflow_amount + " more...";
        tr = document.createElement("tr");
        th = document.createElement("th");
        th.appendChild(document.createTextNode(overflow_text));
        tr.appendChild(th);
        th = document.createElement("th");
        th.colSpan = 2;
        tr.appendChild(th);
        overflow.appendChild(tr);
    }

    //fill in the overflow table footer for active ports
    overflow = m_selection["ports_in"].nextElementSibling;
    removeChildren(overflow);
    overflow_amount = node.details["unique_ports"] - node.details["ports_in"].length;
    if (overflow_amount > 0) {
        overflow_text = "Plus " + overflow_amount + " more...";
        tr = document.createElement("tr");
        th = document.createElement("th");
        th.appendChild(document.createTextNode(overflow_text));
        tr.appendChild(th);
        th = document.createElement("th");
        tr.appendChild(th);
        overflow.appendChild(tr);
    }

    //enable new popups (tooltips)
    $('.popup').popup();
}