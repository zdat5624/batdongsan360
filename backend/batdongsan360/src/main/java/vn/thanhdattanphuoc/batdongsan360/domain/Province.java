package vn.thanhdattanphuoc.batdongsan360.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "provinces")
public class Province {

    @Id
    private long code;

    private String name;
    @JsonIgnore
    private String codename;
    @JsonProperty("division_type")
    private String divisionType;
    @JsonProperty("phone_code")
    @JsonIgnore
    private int phoneCode;

    @OneToMany(mappedBy = "province")
    @JsonIgnore
    private List<Post> post;

    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<District> districts;

    public long getCode() {
        return code;
    }

    public void setCode(long code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCodename() {
        return codename;
    }

    public void setCodename(String codename) {
        this.codename = codename;
    }

    public String getDivisionType() {
        return divisionType;
    }

    public void setDivisionType(String divisionType) {
        this.divisionType = divisionType;
    }

    public int getPhoneCode() {
        return phoneCode;
    }

    public void setPhoneCode(int phoneCode) {
        this.phoneCode = phoneCode;
    }

    public List<District> getDistricts() {
        return districts;
    }

    public void setDistricts(List<District> districts) {
        this.districts = districts;
    }

    public List<Post> getPost() {
        return post;
    }

    public void setPost(List<Post> post) {
        this.post = post;
    }

}