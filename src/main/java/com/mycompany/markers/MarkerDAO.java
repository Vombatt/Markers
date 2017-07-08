/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.markers;

import java.util.List;
import org.apache.ibatis.session.SqlSession;

/**
 *
 * @author Alexey
 */
public class MarkerDAO {
    public List<String>getData(){
        SqlSession session = MyBatisUtil.getSqlSessionFactory().openSession();
        MarkerMapper mapper = session.getMapper(MarkerMapper.class);
        List<String> listOfFeatures = mapper.selectFeatures();
        session.close();
        return listOfFeatures;
    };
    
    public void save(Marker marker){
        SqlSession session = MyBatisUtil.getSqlSessionFactory().openSession();
        MarkerMapper mapper = session.getMapper(MarkerMapper.class);
        mapper.insertMarker(marker);
        session.commit();
        session.close();
    }
    
    public void update(Marker marker){
        SqlSession session = MyBatisUtil.getSqlSessionFactory().openSession();
        MarkerMapper mapper = session.getMapper(MarkerMapper.class);
        mapper.updateMarker(marker);
        session.commit();
        session.close();
    }
    
    public void delete(Long id){
        SqlSession session = MyBatisUtil.getSqlSessionFactory().openSession();
        MarkerMapper mapper = session.getMapper(MarkerMapper.class);
        mapper.deleteMarker(id);
        session.commit();
        session.close();
    }
}
