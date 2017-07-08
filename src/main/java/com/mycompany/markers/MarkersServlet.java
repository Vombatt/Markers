/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.markers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 *
 * @author Alexey
 */
@WebServlet(name = "MarkersServlet", urlPatterns = {"/MarkersServlet"})
public class MarkersServlet extends HttpServlet {
    MarkerDAO markerDAO = new MarkerDAO();
    Marker marker = new Marker();
    String json = "{\"paramsArray\": [\"first\", 100], "
            + "\"paramsObj\": {\"one\": \"two\", \"three\": \"four\"}, "
            + "\"paramsStr\": \"some string\"}";

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        BufferedReader br = new BufferedReader(new InputStreamReader(request.getInputStream()));
        System.out.println("--------Данные для добавления в БД---------");
        System.out.println(request);
        String feature = br.readLine();
        marker.setFeature(feature);
        System.out.println(feature);
        System.out.println("Начало Парсинга");
        int[] sarray = {0, 2, 8, 1};
        
        
        try {
            JSONParser parser = new JSONParser();

            Object obj = parser.parse(feature);
            JSONObject jsonObj = (JSONObject) obj;
            System.out.println(jsonObj.get("id"));
            String featIdStr = jsonObj.get("id").toString();
            long featId = Long.parseLong(featIdStr);
            marker.setId(featId);

            System.out.println(jsonObj.get("type"));


            JSONArray ja = (JSONArray) jsonObj.get("coord");
            System.out.println(ja.toString());
        } catch (ParseException ex) {
            System.err.println(ex);
        }
        
        markerDAO.save(marker);
        System.out.println("-----data saved-----");
       
        //response.setContentType("application/json");//Отправляем от сервера данные в JSON -формате
        response.setCharacterEncoding("utf-8");//Кодировка отправляемых данных
        PrintWriter out = response.getWriter();
        out.print(sarray);

    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
